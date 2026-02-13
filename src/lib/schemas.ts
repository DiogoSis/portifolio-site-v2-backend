import { z } from 'zod';

// Certificate Schema
export const CertificateSchema = z.object({
  id: z.number().positive(),
  categoryCode: z.string().min(1),
  certificateUrl: z.string().url(),
  courseName: z.string().min(1),
  finishedAt: z.string(), // Format: MM/DD/YYYY
  imageUrl: z.string().url(),
  startedAt: z.string(), // Format: MM/DD/YYYY
});

export const CreateCertificateSchema = CertificateSchema;
export const UpdateCertificateSchema = CertificateSchema.partial().required({ id: true });

export type Certificate = z.infer<typeof CertificateSchema>;

// Formation Schema
export const FormationSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1),
  area: z.string().min(1),
  certificate: z.string().url(),
  conclusion: z.string(), // Format: MM/DD/YYYY
  materias: z.array(z.string()),
});

export const CreateFormationSchema = FormationSchema;
export const UpdateFormationSchema = FormationSchema.partial().required({ id: true });

export type Formation = z.infer<typeof FormationSchema>;

// Project Schema
export const ProjectSchema = z.object({
  id: z.number().positive(),
  projectName: z.string().min(1),
  description: z.string().min(1),
  categoryLocal: z.string().min(1),
  typePerformance: z.string().min(1),
  imagesUrl: z.array(z.string().url()),
  technologiesUsed: z.array(z.string()),
});

export const CreateProjectSchema = ProjectSchema;
export const UpdateProjectSchema = ProjectSchema.partial().required({ id: true });

export type Project = z.infer<typeof ProjectSchema>;

// Knowledge Schema
export const KnowledgeSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1),
  icon: z.string().url(),
  type: z.string().min(1),
  rating: z.number().min(1).max(5),
});

export const CreateKnowledgeSchema = KnowledgeSchema;
export const UpdateKnowledgeSchema = KnowledgeSchema.partial().required({ id: true });

export type Knowledge = z.infer<typeof KnowledgeSchema>;
