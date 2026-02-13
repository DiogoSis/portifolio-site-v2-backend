import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { scanTable } from '../../lib/dynamodb.js';
import { createResponse, handleError } from '../../lib/response.js';

const TABLE_NAME = process.env.FORMATIONS_TABLE || 'formations';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const items = await scanTable(TABLE_NAME);
    
    return createResponse(200, {
      data: items,
      count: items.length,
    });
  } catch (error) {
    return handleError(error);
  }
};
