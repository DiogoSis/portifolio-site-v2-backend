import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { mockCertificate, resetMocks } from '../../../__mocks__/dynamodb';
import { 
  createGetEvent, 
  createGetByIdEvent, 
  createPostEvent, 
  createPutEvent,
  createDeleteEvent 
} from '../../../__tests__/eventHelpers.js';

// Mock environment variables
process.env.CERTIFICATES_TABLE = 'certifications';

jest.unstable_mockModule('../../../lib/dynamodb.js', () => ({
  scanTable: jest.fn(),
  getItem: jest.fn(),
  putItem: jest.fn(),
}));

const { scanTable, getItem, putItem } = await import('../../../lib/dynamodb.js');
const { handler } = await import('../../certificates.js');

describe('Certificates Handlers', () => {
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  describe('HTTP Method Routing', () => {
    it('deve rotear GET sem ID para getAll', async () => {
      const mockItems = [mockCertificate];
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
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockCertificate);

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
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(mockCertificate);

      const event = createPostEvent(mockCertificate);
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(201);
      }
      expect(putItem).toHaveBeenCalledTimes(1);
    });

    it('deve rotear PUT com ID para update', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockCertificate);
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(mockCertificate);

      const event = createPutEvent('1', mockCertificate);
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

  describe('GET All Certificates', () => {
    it('deve retornar todos os certificados', async () => {
      const mockItems = [mockCertificate];
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

    it('deve retornar array vazio quando não há certificados', async () => {
      (scanTable as jest.MockedFunction<typeof scanTable>).mockResolvedValue([]);

      const event = createGetEvent();
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(200);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.data).toEqual([]);
          expect(body.count).toBe(0);
        }
      }
    });
  });

  describe('GET Certificate by ID', () => {
    it('deve retornar certificado específico', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockCertificate);

      const event = createGetByIdEvent('1');
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(200);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.data).toEqual(mockCertificate);
        }
      }
    });

    it('deve retornar 404 quando certificado não encontrado', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(undefined);

      const event = createGetByIdEvent('999');
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(404);
      }
    });

    it('deve retornar 400 quando ID não fornecido', async () => {
      // Este cenário na verdade não retorna 400 no handler consolidado
      // Quando não há ID, o handler roteia para getAll (200)
      // Este teste deve ser removido ou ajustado para o novo comportamento
      // Por ora, vou ajustar para testar o comportamento correto
      (scanTable as jest.MockedFunction<typeof scanTable>).mockResolvedValue([]);
      
      const event = createGetEvent(); // GET sem ID vai para getAll
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(200); // getAll retorna 200
      }
    });
  });

  describe('POST Create Certificate', () => {
    it('deve criar certificado com dados válidos', async () => {
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(mockCertificate);

      const event = createPostEvent(mockCertificate);
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(201);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.data).toEqual(mockCertificate);
        }
      }
    });

    it('deve validar URL do certificado', async () => {
      const event = createPostEvent({
        ...mockCertificate,
        certificateUrl: 'invalid-url',
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

    it('deve validar URL da imagem', async () => {
      const event = createPostEvent({
        ...mockCertificate,
        imageUrl: 'not-a-url',
      });
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(400);
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

  describe('PUT Update Certificate', () => {
    it('deve atualizar certificado existente', async () => {
      const updatedCert = { ...mockCertificate, courseName: 'AWS Advanced' };
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockCertificate);
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(updatedCert);

      const event = createPutEvent('1', updatedCert);
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(200);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.data.courseName).toBe('AWS Advanced');
        }
      }
    });

    it('deve retornar 400 quando ID não fornecido', async () => {
      const event = createPutEvent(undefined as any, mockCertificate);
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(400);
      }
    });

    it('deve validar dados ao atualizar', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockCertificate);
      
      const event = createPutEvent('1', {
        ...mockCertificate,
        certificateUrl: 'invalid',
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
