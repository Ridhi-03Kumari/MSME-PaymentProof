import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { success, error } from '../lib/response';
import { validateFileType } from '../lib/validation';

const s3 = new S3Client({});
const BUCKET = process.env.DOCUMENTS_BUCKET!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;
    if (!userId) return error('Unauthorized', 401);

    const body = JSON.parse(event.body ?? '{}');
    const { invoiceId, fileName, fileType } = body;

    if (!invoiceId || !fileName || !fileType) return error('Missing required fields');
    if (!validateFileType(fileType)) return error('Invalid file type. Only PDF, JPG, and PNG are allowed.');

    // Sanitize fileName to prevent path traversal
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileKey = `documents/${userId}/${invoiceId}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
      ContentType: fileType,
      Metadata: { userId, invoiceId },
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes

    return success({ uploadUrl, fileKey });
  } catch (e) {
    console.error('getUploadUrl error:', e);
    return error('Internal server error', 500);
  }
};
