import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { mockKnowledge, resetMocks } from '../../../__mocks__/dynamodb';
import { 
  createGetEvent, 
  createGetByIdEvent, 
  createPostEvent, 
  createPutEvent,
  createDeleteEvent 
} from '../../../__tests__/eventHelpers.js';

// Mock environment variables
process.env.KNOWLEDGE_TABLE = 'knowledge';

jest.unstable_mockModule('../../../lib/dynamodb.js', () => ({
  scanTable: jest.fn(),
  getItem: jest.fn(),
  putItem: jest.fn(),
}));

const { scanTable, getItem, putItem } = await import('../../../lib/dynamodb.js');
const { handler } = await import('../../knowledge.js');

describe('Knowledge Handlers', () => {
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  describe('HTTP Method Routing', () => {
    it('deve rotear GET sem ID para getAll', async () => {
      const mockItems = [mockKnowledge];
      (scanTable as jest.MockedFunction<typeof scanTable>).mockResolvedValue(mockItems);

      const event = createGetEvent();
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(200);
      }
      
      expect(scanTable).toHaveBeenCalledTimes(1);
    });

    it('deve rotear GET com ID para getById', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockKnowledge);

      const event = createGetByIdEvent('1');
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(200);
      }
      
      expect(getItem).toHaveBeenCalledTimes(1);
    });

    it('deve rotear POST para create', async () => {
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(mockKnowledge);

      const event = createPostEvent(mockKnowledge);
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(201);
      }
      
      expect(putItem).toHaveBeenCalledTimes(1);
    });

    it('deve rotear PUT com ID para update', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockKnowledge);
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(mockKnowledge);

      const event = createPutEvent('1', mockKnowledge);
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(200);
      }
      
      expect(putItem).toHaveBeenCalledTimes(1);
    });

    it('deve retornar 405 para método DELETE não suportado', async () => {
      const event = createDeleteEvent('1');
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(405);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.error).toContain('Method not allowed');
        }
      }
    });
  });

  describe('GET All Knowledge', () => {
    it('deve retornar todos os conhecimentos', async () => {
      const mockItems = [mockKnowledge];
      (scanTable as jest.MockedFunction<typeof scanTable>).mockResolvedValue(mockItems);

      const event = createGetEvent();
      const result = await handler(event, {} as any, {} as any);

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

      const event = createGetByIdEvent('1');
      const result = await handler(event, {} as any, {} as any);

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

      const event = createGetByIdEvent('999');
      const result = await handler(event, {} as any, {} as any);

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

      const event = createPostEvent(mockKnowledge);
      const result = await handler(event, {} as any, {} as any);

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
      const event = createPostEvent({
        ...mockKnowledge,
        rating: 0,
      });
      const result = await handler(event, {} as any, {} as any);

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
      const event = createPostEvent({
        ...mockKnowledge,
        rating: 6,
      });
      const result = await handler(event, {} as any, {} as any);

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
      const event = createPostEvent({
        ...mockKnowledge,
        icon: 'invalid-url',
      });
      const result = await handler(event, {} as any, {} as any);

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
      const event = createPostEvent(null as any);
      event.body = undefined;
      const result = await handler(event, {} as any, {} as any);

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

      const event = createPutEvent('1', updatedKnowledge);
      const result = await handler(event, {} as any, {} as any);

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
      
      const event = createPutEvent('1', {
        ...mockKnowledge,
        rating: 10,
      });
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(400);
      }
    });
  });
});
