import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { mockCertificate, resetMocks } from '../../../__mocks__/dynamodb';

// Mock environment variables
process.env.CERTIFICATES_TABLE = 'certifications';

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

describe('Certificates Handlers', () => {
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  describe('GET All Certificates', () => {
    it('deve retornar todos os certificados', async () => {
      const mockItems = [mockCertificate];
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

    it('deve retornar array vazio quando não há certificados', async () => {
      (scanTable as jest.MockedFunction<typeof scanTable>).mockResolvedValue([]);

      const event = {} as any;
      const result = await getAllHandler(event, {} as any, {} as any);

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

      const event = { pathParameters: { id: '1' } } as any;
      const result = await getByIdHandler(event, {} as any, {} as any);

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

      const event = { pathParameters: { id: '999' } } as any;
      const result = await getByIdHandler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(404);
      }
    });

    it('deve retornar 400 quando ID não fornecido', async () => {
      const event = { pathParameters: {} } as any;
      const result = await getByIdHandler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(400);
      }
    });
  });

  describe('POST Create Certificate', () => {
    it('deve criar certificado com dados válidos', async () => {
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(mockCertificate);

      const event = {
        body: JSON.stringify(mockCertificate),
      } as any;
      const result = await createHandler(event, {} as any, {} as any);

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
      const event = {
        body: JSON.stringify({
          ...mockCertificate,
          certificateUrl: 'invalid-url',
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

    it('deve validar URL da imagem', async () => {
      const event = {
        body: JSON.stringify({
          ...mockCertificate,
          imageUrl: 'not-a-url',
        }),
      } as any;
      const result = await createHandler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(400);
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

  describe('PUT Update Certificate', () => {
    it('deve atualizar certificado existente', async () => {
      const updatedCert = { ...mockCertificate, courseName: 'AWS Advanced' };
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockCertificate);
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(updatedCert);

      const event = {
        pathParameters: { id: '1' },
        body: JSON.stringify(updatedCert),
      } as any;
      const result = await updateHandler(event, {} as any, {} as any);

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
      const event = {
        pathParameters: {},
        body: JSON.stringify(mockCertificate),
      } as any;
      const result = await updateHandler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(400);
      }
    });

    it('deve validar dados ao atualizar', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockCertificate);
      
      const event = {
        pathParameters: { id: '1' },
        body: JSON.stringify({
          ...mockCertificate,
          certificateUrl: 'invalid',
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
