import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { scanTable, getItem, putItem } from '../lib/dynamodb.js';
import { CreateFormationSchema, UpdateFormationSchema } from '../lib/schemas.js';
import { createResponse, createErrorResponse, handleError } from '../lib/response.js';

const TABLE_NAME = process.env.FORMATIONS_TABLE || 'formations';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const method = event.requestContext.http.method;
    const id = event.pathParameters?.id;

    // Roteamento baseado em método HTTP
    switch (method) {
      case 'GET':
        return id ? await getById(id) : await getAll();
      
      case 'POST':
        return await create(event.body);
      
      case 'PUT':
        if (!id) {
          return createErrorResponse(400, 'Missing id parameter');
        }
        return await update(id, event.body);
      
      default:
        return createErrorResponse(405, 'Method not allowed');
    }
  } catch (error) {
    return handleError(error);
  }
};

// GET All Formations
async function getAll() {
  const items = await scanTable(TABLE_NAME);
  
  return createResponse(200, {
    data: items,
    count: items.length,
  });
}

// GET Formation by ID
async function getById(id: string) {
  const numericId = parseInt(id, 10);
  
  if (isNaN(numericId)) {
    return createErrorResponse(400, 'Invalid id format - must be a number');
  }
  
  const item = await getItem(TABLE_NAME, numericId);
  
  if (!item) {
    return createErrorResponse(404, `Formation with id ${numericId} not found`);
  }
  
  return createResponse(200, { data: item });
}

// POST Create Formation
async function create(body: string | undefined) {
  if (!body) {
    return createErrorResponse(400, 'Missing request body');
  }
  
  const parsed = JSON.parse(body);
  
  // Validate using Zod schema
  const validationResult = CreateFormationSchema.safeParse(parsed);
  
  if (!validationResult.success) {
    return createErrorResponse(400, `Validation error: ${validationResult.error.message}`);
  }
  
  const item = await putItem(TABLE_NAME, validationResult.data);
  
  return createResponse(201, {
    message: 'Formation created successfully',
    data: item,
  });
}

// PUT Update Formation
async function update(id: string, body: string | undefined) {
  const numericId = parseInt(id, 10);
  
  if (isNaN(numericId)) {
    return createErrorResponse(400, 'Invalid id format - must be a number');
  }
  
  if (!body) {
    return createErrorResponse(400, 'Missing request body');
  }
  
  // Check if item exists
  const existingItem = await getItem(TABLE_NAME, numericId);
  
  if (!existingItem) {
    return createErrorResponse(404, `Formation with id ${numericId} not found`);
  }
  
  const parsed = JSON.parse(body);
  
  // Validate using Zod schema
  const validationResult = UpdateFormationSchema.safeParse({ ...parsed, id: numericId });
  
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
    message: 'Formation updated successfully',
    data: item,
  });
}
