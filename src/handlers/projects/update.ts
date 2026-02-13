import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { getItem, putItem } from '../../lib/dynamodb.js';
import { UpdateProjectSchema } from '../../lib/schemas.js';
import { createResponse, createErrorResponse, handleError } from '../../lib/response.js';

const TABLE_NAME = process.env.PROJECTS_TABLE || 'projects';

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
    
    if (!event.body) {
      return createErrorResponse(400, 'Missing request body');
    }
    
    // Check if item exists
    const existingItem = await getItem(TABLE_NAME, numericId);
    
    if (!existingItem) {
      return createErrorResponse(404, `Project with id ${numericId} not found`);
    }
    
    const body = JSON.parse(event.body);
    
    // Validate using Zod schema
    const validationResult = UpdateProjectSchema.safeParse({ ...body, id: numericId });
    
    if (!validationResult.success) {
      return createErrorResponse(400, `Validation error: ${validationResult.error.message}`);
    }
    
    // Merge with existing data (partial update)
    const updatedItem = {
      ...existingItem,
      ...validationResult.data,
    };
    
    const item = await putItem(TABLE_NAME, updatedItem);
    
    return createResponse(200, {
      message: 'Project updated successfully',
      data: item,
    });
  } catch (error) {
    return handleError(error);
  }
};
