# Estágio 1: Builder - Onde o código é compilado
FROM node:22-alpine AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala TODAS as dependências (incluindo devDependencies para o build)
RUN npm install

# Copia o resto do código-fonte
COPY . .

# Compila o código TypeScript para JavaScript
RUN npm run build

# Estágio 2: Produção - A imagem final e otimizada
FROM node:22-alpine

WORKDIR /app

# Copia apenas os artefatos de produção do estágio 'builder'
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instala apenas as dependências de produção
RUN npm install --omit=dev

# Expõe a porta que a aplicação vai usar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD [ "node", "dist/index.js" ]