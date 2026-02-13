import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { mockFormation, resetMocks } from '../../../__mocks__/dynamodb';

// Mock environment variables
process.env.FORMATIONS_TABLE = 'formations';

jest.unstable_mockModule('../../../lib/dynamodb.js', () => ({
  scanTable: jest.fn(),
  getItem: jest.fn(),
  putItem: jest.fn(),
}));

const { scanTable, getItem, putItem } = await import('../../../lib/dynamodb.js');
const { handler: getAllHandler } = await import('../getAll.js');
const { handler: getByIdHandler } = await import('../getById.js');
const { handler: createHandler } = await import('../create.js');

describe('Formations Handlers', () => {
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  describe('GET All Formations', () => {
    it('deve retornar todas as formações', async () => {
      const mockItems = [mockFormation];
      (scanTable as jest.MockedFunction<typeof scanTable>).mockResolvedValue(mockItems);

      const event = {} as any;
      const result = await getAllHandler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(200);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.data).toEqual(mockItems);
          expect(body.count).toBe(1);
        }
      }
    });
  });

  describe('GET Formation by ID', () => {
    it('deve retornar formação específica', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockFormation);

      const event = { pathParameters: { id: '1' } } as any;
      const result = await getByIdHandler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(200);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.data).toEqual(mockFormation);
        }
      }
    });

    it('deve retornar 404 quando formação não encontrada', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(undefined);

      const event = { pathParameters: { id: '999' } } as any;
      const result = await getByIdHandler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(404);
      }
    });
  });

  describe('POST Create Formation', () => {
    it('deve criar formação com array de matérias', async () => {
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(mockFormation);

      const event = {
        body: JSON.stringify(mockFormation),
      } as any;
      const result = await createHandler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(201);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.data.materias).toEqual(mockFormation.materias);
        }
      }
    });

    it('deve validar que materias é array', async () => {
      const event = {
        body: JSON.stringify({
          ...mockFormation,
          materias: 'not-an-array',
        }),
      } as any;
      const result = await createHandler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(400);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.error).toContain('Validation error');
        }
      }
    });

    it('deve rejeitar body vazio', async () => {
      const event = {} as any;
      const result = await createHandler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(400);
      }
    });
  });
});
