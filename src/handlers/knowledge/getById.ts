import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { getItem } from '../../lib/dynamodb.js';
import { createResponse, createErrorResponse, handleError } from '../../lib/response.js';

const TABLE_NAME = process.env.KNOWLEDGE_TABLE || 'knowledge';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return createErrorResponse(400, 'Missing id parameter');
    }
    
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId)) {
      return createErrorResponse(400, 'Invalid id format - must be a number');
    }
    
    const item = await getItem(TABLE_NAME, numericId);
    
    if (!item) {
      return createErrorResponse(404, `Knowledge with id ${numericId} not found`);
    }
    
    return createResponse(200, { data: item });
  } catch (error) {
    return handleError(error);
  }
};
