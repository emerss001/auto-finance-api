import { z } from 'zod';

export const envSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().min(1),
  DB_PASS: z.string().min(1),
  DB_NAME: z.string().min(1),
  PORT: z.coerce.number().default(3333),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    console.error('❌ Variáveis de ambiente inválidas:', parsed.error.format());
    throw new Error('Falha na validação das variáveis de ambiente');
  }

  return parsed.data;
}
