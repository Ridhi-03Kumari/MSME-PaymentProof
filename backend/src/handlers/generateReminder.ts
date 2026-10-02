import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { success, error } from '../lib/response';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = process.env.INVOICES_TABLE!;

function formatIndianNumber(amount: number): string {
  return amount.toLocaleString('en-IN');
}

function formatDateDisplay(dateStr: string | null): string {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;
    if (!userId) return error('Unauthorized', 401);

    const invoiceId = event.pathParameters?.invoiceId;
    if (!invoiceId) return error('Missing invoiceId');

    const result = await ddb.send(new GetCommand({
      TableName: TABLE,
      Key: { userId, invoiceId },
    }));

    if (!result.Item) return error('Invoice not found', 404);

    const invoice = result.Item;
    const businessName = event.queryStringParameters?.businessName ?? 'Your Business Name';

    let draft: string;
    if (!invoice.dueDate) {
      draft = `Subject: Payment follow-up for Invoice ${invoice.invoiceNumber}\n\nDear ${invoice.buyerName},\n\nThis is a polite follow-up regarding Invoice ${invoice.invoiceNumber} for ₹${formatIndianNumber(invoice.invoiceAmount)}. The payment terms are currently pending confirmation. Please review and confirm the agreed payment terms at your earliest convenience.\n\nRegards,\n${businessName}`;
    } else {
      draft = `Subject: Payment follow-up for Invoice ${invoice.invoiceNumber}\n\nDear ${invoice.buyerName},\n\nThis is a polite follow-up regarding Invoice ${invoice.invoiceNumber} for ₹${formatIndianNumber(invoice.invoiceAmount)}, dated ${formatDateDisplay(invoice.invoiceDate)}. According to the recorded payment terms, payment was due on ${formatDateDisplay(invoice.dueDate)}.\n\nPlease confirm the expected payment date. The relevant invoice and delivery records are available for reference.\n\nRegards,\n${businessName}`;
    }

    return success({ draft, invoiceId });
  } catch (e) {
    console.error('generateReminder error:', e);
    return error('Internal server error', 500);
  }
};
