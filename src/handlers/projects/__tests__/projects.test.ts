import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { mockProject, resetMocks } from '../../../__mocks__/dynamodb';
import { 
  createGetEvent, 
  createGetByIdEvent, 
  createPostEvent, 
  createPutEvent,
  createDeleteEvent 
} from '../../../__tests__/eventHelpers.js';

// Mock environment variables
process.env.PROJECTS_TABLE = 'projects';

jest.unstable_mockModule('../../../lib/dynamodb.js', () => ({
  scanTable: jest.fn(),
  getItem: jest.fn(),
  putItem: jest.fn(),
}));

const { scanTable, getItem, putItem } = await import('../../../lib/dynamodb.js');
const { handler } = await import('../../projects.js');

describe('Projects Handlers', () => {
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  describe('HTTP Method Routing', () => {
    it('deve rotear GET sem ID para getAll', async () => {
      const mockItems = [mockProject];
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
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockProject);

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
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(mockProject);

      const event = createPostEvent(mockProject);
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(201);
      }
      
      expect(putItem).toHaveBeenCalledTimes(1);
    });

    it('deve rotear PUT com ID para update', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockProject);
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(mockProject);

      const event = createPutEvent('1', mockProject);
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

  describe('GET All Projects', () => {
    it('deve retornar todos os projetos', async () => {
      const mockItems = [mockProject];
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

  describe('GET Project by ID', () => {
    it('deve retornar projeto específico', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockProject);

      const event = createGetByIdEvent('1');
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(200);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.data).toEqual(mockProject);
        }
      }
    });

    it('deve retornar 404 quando projeto não encontrado', async () => {
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

  describe('POST Create Project', () => {
    it('deve criar projeto com arrays de imagens e tecnologias', async () => {
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(mockProject);

      const event = createPostEvent(mockProject);
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(201);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(Array.isArray(body.data.imagesUrl)).toBe(true);
          expect(Array.isArray(body.data.technologiesUsed)).toBe(true);
        }
      }
    });

    it('deve validar URLs nas imagens', async () => {
      const event = createPostEvent({
        ...mockProject,
        imagesUrl: ['invalid-url', 'another-invalid'],
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

    it('deve validar que technologiesUsed é array de strings', async () => {
      const event = createPostEvent({
        ...mockProject,
        technologiesUsed: 'not-an-array',
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

  describe('PUT Update Project', () => {
    it('deve atualizar projeto existente', async () => {
      const updatedProject = { ...mockProject, projectName: 'Updated Project' };
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockProject);
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(updatedProject);

      const event = createPutEvent('1', updatedProject);
      const result = await handler(event, {} as any, {} as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      if (result && typeof result === 'object' && 'statusCode' in result) {
        expect(result.statusCode).toBe(200);
        
        if ('body' in result && typeof result.body === 'string') {
          const body = JSON.parse(result.body);
          expect(body.data.projectName).toBe('Updated Project');
        }
      }
    });

    it('deve validar dados ao atualizar', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockProject);
      
      const event = createPutEvent('1', {
        ...mockProject,
        imagesUrl: ['invalid'],
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
