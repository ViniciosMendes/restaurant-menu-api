# ========================
# STAGE 1: BUILDER
# ========================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ========================
# STAGE 2: PRODUCTION
# ========================
FROM node:22-alpine

WORKDIR /app

# Copia arquivos compilados e package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instala apenas dependências de produção
RUN npm install --omit=dev

ENV NODE_ENV=production

EXPOSE 3000

# Executa migrations em JS e depois inicia a API
CMD ["sh", "-c", "npm run migration:run:prod && node dist/index.js"]