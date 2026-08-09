FROM node:22-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependências
COPY package.json pnpm-lock.yaml ./
# Ignoramos scripts de build de dependências (como o scarf) que causam falha no pnpm v9+ no Docker
RUN pnpm config set ignore-scripts true && pnpm install --frozen-lockfile

# Fazer build
COPY . .
RUN pnpm build

# Imagem final
FROM node:22-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependências
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm config set ignore-scripts true && pnpm install --prod --frozen-lockfile

# Copiar arquivos buildados
COPY --from=builder /app/dist ./dist

# A porta padrão do NestJS geralmente é 3000
EXPOSE 3000

CMD ["node", "dist/main.js"]
