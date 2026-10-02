import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { success, error } from '../lib/response';
import { sanitizeString, validateInvoiceAmount, validatePaymentTerms } from '../lib/validation';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = process.env.INVOICES_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;
    if (!userId) return error('Unauthorized', 401);

    const invoiceId = event.pathParameters?.invoiceId;
    if (!invoiceId) return error('Missing invoiceId');

    const body = JSON.parse(event.body ?? '{}');

    // Validate and sanitize allowed fields only
    const allowed = ['buyerName', 'paymentTermsDays', 'dueDate', 'status', 'notes', 'reminderDraft', 'evidence'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (updates.buyerName) updates.buyerName = sanitizeString(updates.buyerName);
    if (updates.invoiceAmount !== undefined && !validateInvoiceAmount(updates.invoiceAmount)) {
      return error('Invalid invoice amount');
    }
    if (updates.paymentTermsDays !== undefined && !validatePaymentTerms(updates.paymentTermsDays)) {
      return error('Invalid payment terms');
    }

    updates.updatedAt = new Date().toISOString();

    const setExpr = Object.keys(updates).map(k => `#${k} = :${k}`).join(', ');
    const exprNames = Object.fromEntries(Object.keys(updates).map(k => [`#${k}`, k]));
    const exprValues = Object.fromEntries(Object.keys(updates).map(k => [`:${k}`, updates[k]]));

    const result = await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { userId, invoiceId },
      UpdateExpression: `SET ${setExpr}`,
      ExpressionAttributeNames: exprNames,
      ExpressionAttributeValues: exprValues,
      ConditionExpression: 'attribute_exists(invoiceId)',
      ReturnValues: 'ALL_NEW',
    }));

    return success(result.Attributes);
  } catch (e: any) {
    if (e.name === 'ConditionalCheckFailedException') return error('Invoice not found', 404);
    console.error('updateInvoice error:', e);
    return error('Internal server error', 500);
  }
};
