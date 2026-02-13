import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { mockKnowledge, resetMocks } from '../../../__mocks__/dynamodb';

// Mock environment variables
process.env.KNOWLEDGE_TABLE = 'knowledge';

jest.unstable_mockModule('../../../lib/dynamodb.js', () => ({
  scanTable: jest.fn(),
  getItem: jest.fn(),
  putItem: jest.fn(),
}));

const { scanTable, getItem, putItem } = await import('../../../lib/dynamodb.js');
const { handler: getAllHandler } = await import('../getAll.js');
const { handler: getByIdHandler } = await import('../getById.js');
const { handler: createHandler } = await import('../create.js');
const { handler: updateHandler } = await import('../update.js');

describe('Knowledge Handlers', () => {
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  describe('GET All Knowledge', () => {
    it('deve retornar todos os conhecimentos', async () => {
      const mockItems = [mockKnowledge];
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

  describe('GET Knowledge by ID', () => {
    it('deve retornar conhecimento específico', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockKnowledge);

      const event = { pathParameters: { id: '1' } } as any;
      const result = await getByIdHandler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(200);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.data).toEqual(mockKnowledge);
        }
      }
    });

    it('deve retornar 404 quando conhecimento não encontrado', async () => {
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

  describe('POST Create Knowledge', () => {
    it('deve criar conhecimento com rating válido', async () => {
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(mockKnowledge);

      const event = {
        body: JSON.stringify(mockKnowledge),
      } as any;
      const result = await createHandler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(201);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.data.rating).toBe(5);
        }
      }
    });

    it('deve rejeitar rating menor que 1', async () => {
      const event = {
        body: JSON.stringify({
          ...mockKnowledge,
          rating: 0,
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

    it('deve rejeitar rating maior que 5', async () => {
      const event = {
        body: JSON.stringify({
          ...mockKnowledge,
          rating: 6,
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

    it('deve validar URL do ícone', async () => {
      const event = {
        body: JSON.stringify({
          ...mockKnowledge,
          icon: 'invalid-url',
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

  describe('PUT Update Knowledge', () => {
    it('deve atualizar conhecimento existente', async () => {
      const updatedKnowledge = { ...mockKnowledge, rating: 4 };
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockKnowledge);
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(updatedKnowledge);

      const event = {
        pathParameters: { id: '1' },
        body: JSON.stringify(updatedKnowledge),
      } as any;
      const result = await updateHandler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(200);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.data.rating).toBe(4);
        }
      }
    });

    it('deve validar rating ao atualizar', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockKnowledge);
      
      const event = {
        pathParameters: { id: '1' },
        body: JSON.stringify({
          ...mockKnowledge,
          rating: 10,
        }),
      } as any;
      const result = await updateHandler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(400);
      }
    });
  });
});
