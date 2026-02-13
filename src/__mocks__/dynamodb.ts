import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { jest } from '@jest/globals';

export const mockScan = jest.fn();
export const mockGet = jest.fn();
export const mockPut = jest.fn();

export const mockDocClient = {
  send: jest.fn((command: any) => {
    const commandName = command.constructor.name;
    
    if (commandName === 'ScanCommand') {
      return mockScan();
    }
    if (commandName === 'GetCommand') {
      return mockGet();
    }
    if (commandName === 'PutCommand') {
      return mockPut();
    }
    
    throw new Error(`Unhandled command: ${commandName}`);
  }),
} as unknown as DynamoDBDocumentClient;

// Mock data
export const mockCertificate = {
  id: 1,
  categoryCode: 'Cloud',
  certificateUrl: 'https://example.com/cert.pdf',
  courseName: 'AWS Certified Solutions Architect',
  finishedAt: '02/12/2026',
  imageUrl: 'https://example.com/aws.svg',
  startedAt: '01/10/2026',
};

export const mockFormation = {
  id: 1,
  name: 'Formação Full Stack',
  area: 'Desenvolvimento Web',
  certificate: 'https://example.com/formation.pdf',
  conclusion: '12/31/2025',
  materias: ['Node.js', 'React', 'TypeScript'],
};

export const mockProject = {
  id: 1,
  projectName: 'E-commerce Platform',
  description: 'Sistema completo de e-commerce',
  categoryLocal: 'Freelance',
  typePerformance: 'Full Stack Developer',
  imagesUrl: ['https://example.com/img1.png'],
  technologiesUsed: ['TypeScript', 'React', 'Node.js'],
};

export const mockKnowledge = {
  id: 1,
  name: 'Docker',
  icon: 'https://cdn.jsdelivr.net/icon.svg',
  type: 'containerização',
  rating: 5,
};

export const resetMocks = () => {
  mockScan.mockReset();
  mockGet.mockReset();
  mockPut.mockReset();
};
