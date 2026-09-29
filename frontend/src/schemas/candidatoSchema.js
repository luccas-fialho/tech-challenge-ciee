import { z } from 'zod'

export const candidatoSchema = z.object({
  nomeCompleto: z
    .string({ required_error: 'Nome completo é obrigatório' })
    .min(1, 'Nome completo é obrigatório'),

  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),

  telefone: z
    .string()
    .optional()
    .or(z.literal('')),

  areaInteresse: z
    .string()
    .max(255, 'Área de interesse deve ter no máximo 255 caracteres')
    .optional()
    .or(z.literal('')),

  resumoProfissional: z
    .string()
    .max(5000, 'Resumo profissional deve ter no máximo 5000 caracteres')
    .optional()
    .or(z.literal('')),
})
