import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { putItem } from '../../lib/dynamodb.js';
import { CreateProjectSchema } from '../../lib/schemas.js';
import { createResponse, createErrorResponse, handleError } from '../../lib/response.js';

const TABLE_NAME = process.env.PROJECTS_TABLE || 'projects';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!event.body) {
      return createErrorResponse(400, 'Missing request body');
    }
    
    const body = JSON.parse(event.body);
    
    // Validate using Zod schema
    const validationResult = CreateProjectSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(400, `Validation error: ${validationResult.error.message}`);
    }
    
    const item = await putItem(TABLE_NAME, validationResult.data);
    
    return createResponse(201, {
      message: 'Project created successfully',
      data: item,
    });
  } catch (error) {
    return handleError(error);
  }
};
