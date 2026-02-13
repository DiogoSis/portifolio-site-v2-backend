import type { APIGatewayProxyResultV2 } from 'aws-lambda';

export function assertIsAPIGatewayResult(
  result: any
): asserts result is APIGatewayProxyResultV2 {
  if (!result || typeof result !== 'object') {
    throw new Error('Result is not an API Gateway result object');
  }
  if (!('statusCode' in result) || !('body' in result)) {
    throw new Error('Result does not have statusCode or body properties');
  }
}

export function parseResponseBody<T = any>(result: APIGatewayProxyResultV2): T {
  assertIsAPIGatewayResult(result);
  return JSON.parse(result.body as string);
}
