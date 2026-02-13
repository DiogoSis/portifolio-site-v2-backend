import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { mockProject, resetMocks } from '../../../__mocks__/dynamodb';

// Mock environment variables
process.env.PROJECTS_TABLE = 'projects';

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

describe('Projects Handlers', () => {
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  describe('GET All Projects', () => {
    it('deve retornar todos os projetos', async () => {
      const mockItems = [mockProject];
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

  describe('GET Project by ID', () => {
    it('deve retornar projeto específico', async () => {
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockProject);

      const event = { pathParameters: { id: '1' } } as any;
      const result = await getByIdHandler(event, {} as any, {} as any);

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

      const event = { pathParameters: { id: '999' } } as any;
      const result = await getByIdHandler(event, {} as any, {} as any);

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

      const event = {
        body: JSON.stringify(mockProject),
      } as any;
      const result = await createHandler(event, {} as any, {} as any);

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
      const event = {
        body: JSON.stringify({
          ...mockProject,
          imagesUrl: ['invalid-url', 'another-invalid'],
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

    it('deve validar que technologiesUsed é array de strings', async () => {
      const event = {
        body: JSON.stringify({
          ...mockProject,
          technologiesUsed: 'not-an-array',
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

  describe('PUT Update Project', () => {
    it('deve atualizar projeto existente', async () => {
      const updatedProject = { ...mockProject, projectName: 'Updated Project' };
      (getItem as jest.MockedFunction<typeof getItem>).mockResolvedValue(mockProject);
      (putItem as jest.MockedFunction<typeof putItem>).mockResolvedValue(updatedProject);

      const event = {
        pathParameters: { id: '1' },
        body: JSON.stringify(updatedProject),
      } as any;
      const result = await updateHandler(event, {} as any, {} as any);

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
      
      const event = {
        pathParameters: { id: '1' },
        body: JSON.stringify({
          ...mockProject,
          imagesUrl: ['invalid'],
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
