import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

// Singleton DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

// Helper functions
export async function scanTable(tableName: string) {
  const command = new ScanCommand({
    TableName: tableName,
  });
  
  const response = await docClient.send(command);
  return response.Items || [];
}

export async function getItem(tableName: string, id: number) {
  const command = new GetCommand({
    TableName: tableName,
    Key: { id },
  });
  
  const response = await docClient.send(command);
  return response.Item;
}

export async function putItem(tableName: string, item: Record<string, any>) {
  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });
  
  await docClient.send(command);
  return item;
}
