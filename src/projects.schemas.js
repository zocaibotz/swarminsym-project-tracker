const { z } = require('zod');

const statusEnum = z.enum(['planned', 'active', 'completed']);

const createProjectSchema = z
  .object({
    name: z.string().trim().min(1),
    description: z.string().trim().optional(),
    status: statusEnum
  })
  .strict();

const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    status: statusEnum.optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided'
  });

module.exports = {
  createProjectSchema,
  updateProjectSchema
};
