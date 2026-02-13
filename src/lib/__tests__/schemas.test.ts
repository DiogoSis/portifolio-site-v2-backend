import { describe, it, expect } from '@jest/globals';
import { 
  CertificateSchema, 
  FormationSchema, 
  ProjectSchema, 
  KnowledgeSchema 
} from '../schemas';

describe('Zod Schemas Validation', () => {
  describe('CertificateSchema', () => {
    it('deve validar certificado válido', () => {
      const validCert = {
        id: 1,
        categoryCode: 'Cloud',
        certificateUrl: 'https://example.com/cert.pdf',
        courseName: 'AWS Course',
        finishedAt: '12/16/2022',
        imageUrl: 'https://example.com/img.svg',
        startedAt: '12/10/2022',
      };

      const result = CertificateSchema.safeParse(validCert);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar ID negativo', () => {
      const invalidCert = {
        id: -1,
        categoryCode: 'Cloud',
        certificateUrl: 'https://example.com/cert.pdf',
        courseName: 'AWS Course',
        finishedAt: '12/16/2022',
        imageUrl: 'https://example.com/img.svg',
        startedAt: '12/10/2022',
      };

      const result = CertificateSchema.safeParse(invalidCert);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar URL inválida', () => {
      const invalidCert = {
        id: 1,
        categoryCode: 'Cloud',
        certificateUrl: 'not-a-url',
        courseName: 'AWS Course',
        finishedAt: '12/16/2022',
        imageUrl: 'https://example.com/img.svg',
        startedAt: '12/10/2022',
      };

      const result = CertificateSchema.safeParse(invalidCert);
      expect(result.success).toBe(false);
    });
  });

  describe('FormationSchema', () => {
    it('deve validar formação válida', () => {
      const validFormation = {
        id: 1,
        name: 'Full Stack',
        area: 'Web Development',
        certificate: 'https://example.com/cert.pdf',
        conclusion: '12/31/2025',
        materias: ['Node.js', 'React'],
      };

      const result = FormationSchema.safeParse(validFormation);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar materias que não é array', () => {
      const invalidFormation = {
        id: 1,
        name: 'Full Stack',
        area: 'Web Development',
        certificate: 'https://example.com/cert.pdf',
        conclusion: '12/31/2025',
        materias: 'not-an-array',
      };

      const result = FormationSchema.safeParse(invalidFormation);
      expect(result.success).toBe(false);
    });
  });

  describe('KnowledgeSchema', () => {
    it('deve validar conhecimento válido', () => {
      const validKnowledge = {
        id: 1,
        name: 'Docker',
        icon: 'https://example.com/icon.svg',
        type: 'containerização',
        rating: 4,
      };

      const result = KnowledgeSchema.safeParse(validKnowledge);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar rating fora do range 1-5', () => {
      const invalidKnowledge = {
        id: 1,
        name: 'Docker',
        icon: 'https://example.com/icon.svg',
        type: 'containerização',
        rating: 10,
      };

      const result = KnowledgeSchema.safeParse(invalidKnowledge);
      expect(result.success).toBe(false);
    });

    it('deve aceitar rating mínimo de 1', () => {
      const validKnowledge = {
        id: 1,
        name: 'Docker',
        icon: 'https://example.com/icon.svg',
        type: 'containerização',
        rating: 1,
      };

      const result = KnowledgeSchema.safeParse(validKnowledge);
      expect(result.success).toBe(true);
    });

    it('deve aceitar rating máximo de 5', () => {
      const validKnowledge = {
        id: 1,
        name: 'Docker',
        icon: 'https://example.com/icon.svg',
        type: 'containerização',
        rating: 5,
      };

      const result = KnowledgeSchema.safeParse(validKnowledge);
      expect(result.success).toBe(true);
    });
  });

  describe('ProjectSchema', () => {
    it('deve validar projeto válido', () => {
      const validProject = {
        id: 1,
        projectName: 'E-commerce',
        description: 'Sistema completo',
        categoryLocal: 'Freelance',
        typePerformance: 'Full Stack',
        imagesUrl: ['https://example.com/img1.png'],
        technologiesUsed: ['TypeScript', 'React'],
      };

      const result = ProjectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar imagesUrl com URLs inválidas', () => {
      const invalidProject = {
        id: 1,
        projectName: 'E-commerce',
        description: 'Sistema completo',
        categoryLocal: 'Freelance',
        typePerformance: 'Full Stack',
        imagesUrl: ['not-a-url'],
        technologiesUsed: ['TypeScript'],
      };

      const result = ProjectSchema.safeParse(invalidProject);
      expect(result.success).toBe(false);
    });
  });
});
