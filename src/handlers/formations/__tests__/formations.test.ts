import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { mockFormation, resetMocks } from '../../../__mocks__/dynamodb';
import { 
  createGetEvent, 
  createGetByIdEvent, 
  createPostEvent, 
  createPutEvent,
  createDeleteEvent 
} from '../../../__tests__/eventHelpers.js';

// Mock environment variables
process.env.FORMATIONS_TABLE = 'formations';

jest.unstable_mockModule('../../../lib/dynamodb.js', () => ({
  scanTable: jest.fn(),
  getItem: jest.fn(),
  putItem: jest.fn(),
}));

const { scanTable, getItem, putItem } = await import('../../../lib/dynamodb.js');
const { handler } = await import('../../formations.js');

describe('Formations Handlers', () => {
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  describe('HTTP Method Routing', () => {
    it('deve rotear GET sem ID para getAll', async () => {
      const mockItems = [mockFormation];
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
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockFormation);

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
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(mockFormation);

      const event = createPostEvent(mockFormation);
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(201);
      }
      
      expect(putItem).toHaveBeenCalledTimes(1);
    });

    it('deve rotear PUT com ID para update', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockFormation);
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(mockFormation);

      const event = createPutEvent('1', mockFormation);
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

  describe('GET All Formations', () => {
    it('deve retornar todas as formações', async () => {
      const mockItems = [mockFormation];
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

  describe('GET Formation by ID', () => {
    it('deve retornar formação específica', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockFormation);

      const event = createGetByIdEvent('1');
      const result = await handler(event, {} as any, {} as any);

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

      const event = createGetByIdEvent('999');
      const result = await handler(event, {} as any, {} as any);

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

      const event = createPostEvent(mockFormation);
      const result = await handler(event, {} as any, {} as any);

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
      const event = createPostEvent({
        ...mockFormation,
        materias: 'not-an-array',
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

  describe('PUT Update Formation', () => {
    it('deve atualizar formação existente', async () => {
      const updatedFormation = { ...mockFormation, name: 'Engenharia de Software Avançada' };
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockFormation);
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(updatedFormation);

      const event = createPutEvent('1', updatedFormation);
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(200);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.data.name).toBe('Engenharia de Software Avançada');
        }
      }
    });

    it('deve retornar 404 quando formação não existe', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(undefined);

      const event = createPutEvent('999', mockFormation);
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(404);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.error).toContain('not found');
        }
      }
    });

    it('deve validar dados ao atualizar', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockFormation);
      
      const event = createPutEvent('1', {
        ...mockFormation,
        materias: 'invalid-not-array',
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
  });
});
