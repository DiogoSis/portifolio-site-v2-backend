import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export function createResponse(statusCode: number, body: any) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify(body),
  };
}

export function createErrorResponse(statusCode: number, message: string) {
  return createResponse(statusCode, {
    error: message,
    timestamp: new Date().toISOString(),
  });
}

export function handleError(error: unknown) {
  console.error('Error:', error);
  
  if (error instanceof Error) {
    return createErrorResponse(500, error.message);
  }
  
  return createErrorResponse(500, 'Internal server error');
}
