import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
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

    const result = await ddb.send(new GetCommand({
      TableName: TABLE,
      Key: { userId, invoiceId },
    }));

    if (!result.Item) return error('Invoice not found', 404);

    return success(result.Item);
  } catch (e) {
    console.error('getInvoice error:', e);
    return error('Internal server error', 500);
  }
};
