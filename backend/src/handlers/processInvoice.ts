import { APIGatewayProxyHandler } from 'aws-lambda';
import { TextractClient, AnalyzeDocumentCommand } from '@aws-sdk/client-textract';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { success, error } from '../lib/response';
import { calculateDueDate, calculateDaysOverdue, calculateStatus } from '../lib/calculations';

const textract = new TextractClient({});
const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = process.env.INVOICES_TABLE!;
const BUCKET = process.env.DOCUMENTS_BUCKET!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;
    if (!userId) return error('Unauthorized', 401);

    const invoiceId = event.pathParameters?.invoiceId;
    if (!invoiceId) return error('Missing invoiceId');

    const body = JSON.parse(event.body ?? '{}');
    const { fileKey } = body;
    if (!fileKey) return error('Missing fileKey');

    // Verify the fileKey belongs to this user (ownership check)
    if (!fileKey.startsWith(`documents/${userId}/`)) {
      return error('Access denied', 403);
    }

    // Call Textract to analyze the document
    const textractResult = await textract.send(new AnalyzeDocumentCommand({
      Document: { S3Object: { Bucket: BUCKET, Name: fileKey } },
      FeatureTypes: ['FORMS', 'TABLES'],
    }));

    // Extract key-value pairs from Textract output
    const extracted = parseTextractResult(textractResult);

    const now = new Date().toISOString();
    const evidence = {
      invoice: 'available' as const,
      purchaseOrder: 'missing' as const,
      proofOfDelivery: 'missing' as const,
      paymentCommunication: 'missing' as const,
      paymentReceipt: 'missing' as const,
    };

    const dueDate = extracted.paymentTermsDays && extracted.invoiceDate
      ? calculateDueDate(extracted.invoiceDate, extracted.paymentTermsDays)
      : null;
    const daysOverdue = dueDate ? calculateDaysOverdue(dueDate, new Date()) : 0;
    const status = calculateStatus({ paymentTermsDays: extracted.paymentTermsDays ?? null, dueDate, daysOverdue, evidence });

    const invoice = {
      userId,
      invoiceId,
      invoiceNumber: extracted.invoiceNumber ?? 'UNKNOWN',
      buyerName: extracted.buyerName ?? 'Unknown',
      invoiceDate: extracted.invoiceDate ?? now.split('T')[0],
      invoiceAmount: extracted.invoiceAmount ?? 0,
      currency: 'INR',
      paymentTermsDays: extracted.paymentTermsDays ?? null,
      dueDate,
      status,
      daysOverdue,
      evidence,
      sourceReferences: [],
      confidence: 'medium' as const,
      fileKey,
      createdAt: now,
      updatedAt: now,
    };

    await ddb.send(new PutCommand({ TableName: TABLE, Item: invoice }));

    return success(invoice, 201);
  } catch (e) {
    console.error('processInvoice error:', e);
    return error('Internal server error', 500);
  }
};

function parseTextractResult(result: any): {
  invoiceNumber?: string;
  buyerName?: string;
  invoiceDate?: string;
  invoiceAmount?: number;
  paymentTermsDays?: number;
} {
  // Parse Textract key-value pairs
  const kvPairs: Record<string, string> = {};
  const blocks = result.Blocks ?? [];
  const keyMap: Record<string, any> = {};
  const valueMap: Record<string, any> = {};

  for (const block of blocks) {
    if (block.BlockType === 'KEY_VALUE_SET') {
      if (block.EntityTypes?.includes('KEY')) keyMap[block.Id] = block;
      else valueMap[block.Id] = block;
    }
  }

  for (const key of Object.values(keyMap) as any[]) {
    const keyText = getTextFromBlock(key, blocks);
    const valueId = key.Relationships?.find((r: any) => r.Type === 'VALUE')?.Ids?.[0];
    if (valueId && valueMap[valueId]) {
      kvPairs[keyText.toLowerCase()] = getTextFromBlock(valueMap[valueId], blocks);
    }
  }

  // Map common invoice field names
  const invoiceNumber = kvPairs['invoice number'] ?? kvPairs['invoice no'] ?? kvPairs['invoice #'];
  const buyerName = kvPairs['bill to'] ?? kvPairs['buyer'] ?? kvPairs['customer name'];
  const invoiceDateStr = kvPairs['invoice date'] ?? kvPairs['date'];
  const amountStr = kvPairs['total amount'] ?? kvPairs['total'] ?? kvPairs['amount due'];
  const termsStr = kvPairs['payment terms'] ?? kvPairs['net days'] ?? kvPairs['terms'];

  return {
    invoiceNumber,
    buyerName,
    invoiceDate: invoiceDateStr ? parseIndianDate(invoiceDateStr) : undefined,
    invoiceAmount: amountStr ? parseAmount(amountStr) : undefined,
    paymentTermsDays: termsStr ? parseTerms(termsStr) : undefined,
  };
}

function getTextFromBlock(block: any, allBlocks: any[]): string {
  const ids = block.Relationships?.find((r: any) => r.Type === 'CHILD')?.Ids ?? [];
  return ids.map((id: string) => allBlocks.find((b: any) => b.Id === id)?.Text ?? '').join(' ');
}

function parseIndianDate(dateStr: string): string | undefined {
  // Try to parse common Indian date formats: DD/MM/YYYY, DD-MM-YYYY, DD Month YYYY
  const clean = dateStr.trim();
  const slashMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (slashMatch) {
    const [, d, m, y] = slashMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return undefined;
}

function parseAmount(amountStr: string): number | undefined {
  const cleaned = amountStr.replace(/[₹,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

function parseTerms(termsStr: string): number | undefined {
  const match = termsStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : undefined;
}
