import { APIGatewayProxyEventV2 } from 'aws-lambda';

/**
 * Helper para criar eventos simulados do API Gateway HTTP API (v2)
 */

export function createGetEvent(): APIGatewayProxyEventV2 {
  return {
    version: '2.0',
    routeKey: 'GET /resource',
    rawPath: '/resource',
    rawQueryString: '',
    headers: {},
    requestContext: {
      accountId: '123456789012',
      apiId: 'api-id',
      domainName: 'api.example.com',
      domainPrefix: 'api',
      http: {
        method: 'GET',
        path: '/resource',
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: 'jest-test',
      },
      requestId: 'test-request-id',
      routeKey: 'GET /resource',
      stage: '$default',
      time: '01/Jan/2026:00:00:00 +0000',
      timeEpoch: 1735689600000,
    },
    isBase64Encoded: false,
  } as any;
}

export function createGetByIdEvent(id: string): APIGatewayProxyEventV2 {
  return {
    ...createGetEvent(),
    routeKey: 'GET /resource/{id}',
    rawPath: `/resource/${id}`,
    pathParameters: {
      id,
    },
    requestContext: {
      ...createGetEvent().requestContext,
      routeKey: 'GET /resource/{id}',
      http: {
        ...createGetEvent().requestContext.http,
        path: `/resource/${id}`,
      },
    },
  } as any;
}

export function createPostEvent(body: object): APIGatewayProxyEventV2 {
  return {
    ...createGetEvent(),
    routeKey: 'POST /resource',
    rawPath: '/resource',
    body: JSON.stringify(body),
    requestContext: {
      ...createGetEvent().requestContext,
      routeKey: 'POST /resource',
      http: {
        ...createGetEvent().requestContext.http,
        method: 'POST',
        path: '/resource',
      },
    },
  } as any;
}

export function createPutEvent(id: string, body: object): APIGatewayProxyEventV2 {
  return {
    ...createGetEvent(),
    routeKey: 'PUT /resource/{id}',
    rawPath: `/resource/${id}`,
    body: JSON.stringify(body),
    pathParameters: {
      id,
    },
    requestContext: {
      ...createGetEvent().requestContext,
      routeKey: 'PUT /resource/{id}',
      http: {
        ...createGetEvent().requestContext.http,
        method: 'PUT',
        path: `/resource/${id}`,
      },
    },
  } as any;
}

export function createDeleteEvent(id: string): APIGatewayProxyEventV2 {
  return {
    ...createGetEvent(),
    routeKey: 'DELETE /resource/{id}',
    rawPath: `/resource/${id}`,
    pathParameters: {
      id,
    },
    requestContext: {
      ...createGetEvent().requestContext,
      routeKey: 'DELETE /resource/{id}',
      http: {
        ...createGetEvent().requestContext.http,
        method: 'DELETE',
        path: `/resource/${id}`,
      },
    },
  } as any;
}
