import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { success, error } from '../lib/response';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = process.env.INVOICES_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;
    if (!userId) return error('Unauthorized', 401);

    const invoiceId = event.pathParameters?.invoiceId;
    if (!invoiceId) return error('Missing invoiceId');

    await ddb.send(new DeleteCommand({
      TableName: TABLE,
      Key: { userId, invoiceId },
      ConditionExpression: 'attribute_exists(invoiceId)',
    }));

    return success({ deleted: true });
  } catch (e: any) {
    if (e.name === 'ConditionalCheckFailedException') return error('Invoice not found', 404);
    console.error('deleteInvoice error:', e);
    return error('Internal server error', 500);
  }
};
