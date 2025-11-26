import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Restaurant Menu API',
      version: '1.0.0',
      description: 'API para gerenciamento de cardápios de restaurantes, seções e itens.',
    },
    servers: [
      {
        url: 'http://localhost:3000/v1',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      schemas: {
        OpeningHour: {
          type: 'object',
          properties: {
            day: { type: 'string', enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
            opensAt: { type: 'string', example: '18:00' },
            closesAt: { type: 'string', example: '23:00' },
          },
        },
        Restaurant: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            kitchenType: { type: 'string' },
            city: { type: 'string' },
            uf: { type: 'string' },
            contact: { type: 'string' },
            opening: { type: 'array', items: { $ref: '#/components/schemas/OpeningHour' } },
          },
        },
        Section: {
          type: 'object',
          properties: {
            section_id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            restaurantId: { type: 'integer' },
          },
        },
        Item: {
          type: 'object',
          properties: {
            item_id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            section_id: { type: 'integer' },
          },
        },
      },
    },
    tags: [
      { name: 'Restaurants', description: 'Gerenciamento de Restaurantes' },
      { name: 'Sections', description: 'Gerenciamento de Seções do Cardápio' },
      { name: 'Items', description: 'Gerenciamento de Itens do Cardápio' },
    ],
    paths: {
      // --- RESTAURANTS ---
      '/restaurants': {
        get: {
          tags: ['Restaurants'],
          summary: 'Listar todos os restaurantes',
          responses: {
            200: { description: 'Lista de restaurantes retornada com sucesso.', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Restaurant' } } } } },
            404: { description: 'Nenhum restaurante encontrado.' },
          },
        },
        post: {
          tags: ['Restaurants'],
          summary: 'Criar um novo restaurante',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Restaurant',
                },
                example: {
                  name: "Pizzaria Top",
                  kitchenType: "Italiana",
                  city: "São Paulo",
                  uf: "SP",
                  contact: "11999999999",
                  opening: [
                    { day: "monday", opensAt: "18:00", closesAt: "23:00" }
                  ]
                }
              },
            },
          },
          responses: {
            201: { description: 'Restaurante criado com sucesso.' },
            400: { description: 'Dados inválidos.' },
          },
        },
      },
      '/restaurants/{id}': {
        get: {
          tags: ['Restaurants'],
          summary: 'Obter restaurante por ID',
          parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true, description: 'ID do restaurante' }],
          responses: {
            200: { description: 'Restaurante encontrado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Restaurant' } } } },
            404: { description: 'Restaurante não encontrado.' },
          },
        },
        patch: {
          tags: ['Restaurants'],
          summary: 'Atualizar restaurante parcialmente',
          parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Restaurant' } } } },
          responses: { 200: { description: 'Atualizado com sucesso.' }, 404: { description: 'Não encontrado.' } },
        },
        delete: {
          tags: ['Restaurants'],
          summary: 'Deletar (desativar) restaurante',
          parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }],
          responses: { 204: { description: 'Deletado com sucesso.' }, 404: { description: 'Não encontrado.' } },
        },
      },
      '/restaurants/{id}/sections': {
        get: {
          tags: ['Restaurants'],
          summary: 'Listar seções de um restaurante',
          parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }],
          responses: {
            200: { content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Section' } } } } },
          },
        },
        post: {
          tags: ['Restaurants'],
          summary: 'Criar seção para um restaurante',
          parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' } } } } }
          },
          responses: { 201: { description: 'Seção criada.' } },
        },
      },
      
      // --- SECTIONS ---
      '/sections/{id}': {
        get: {
            tags: ['Sections'],
            summary: 'Obter seção por ID',
            parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }],
            responses: { 200: { description: 'Sucesso.' }, 404: { description: 'Não encontrado.' } }
        },
        put: {
            tags: ['Sections'],
            summary: 'Atualizar seção (Full)',
            parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }],
            requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Section' } } } },
            responses: { 200: { description: 'Atualizado.' } }
        },
        patch: {
            tags: ['Sections'],
            summary: 'Atualizar seção (Parcial)',
            parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }],
            requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Section' } } } },
            responses: { 200: { description: 'Atualizado.' } }
        },
        delete: {
            tags: ['Sections'],
            summary: 'Deletar seção',
            parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }],
            responses: { 204: { description: 'Deletado.' } }
        }
      },
      '/sections/{id}/items': {
        get: {
            tags: ['Sections'],
            summary: 'Listar itens de uma seção',
            parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }],
            responses: { 200: { content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Item' } } } } } }
        },
        post: {
            tags: ['Sections'],
            summary: 'Criar item em uma seção',
            parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }],
            requestBody: {
                content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, price: { type: 'number' } } } } }
            },
            responses: { 201: { description: 'Item criado.' } }
        }
      },

      // --- ITEMS ---
      '/items/{id}': {
        get: {
            tags: ['Items'],
            summary: 'Obter item por ID',
            parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }],
            responses: { 200: { description: 'Sucesso.' } }
        },
        put: {
            tags: ['Items'],
            summary: 'Atualizar item (Full)',
            parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }],
            requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Item' } } } },
            responses: { 200: { description: 'Atualizado.' } }
        },
        patch: {
            tags: ['Items'],
            summary: 'Atualizar item (Parcial)',
            parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }],
            requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Item' } } } },
            responses: { 200: { description: 'Atualizado.' } }
        },
        delete: {
            tags: ['Items'],
            summary: 'Deletar item',
            parameters: [{ in: 'path', name: 'id', schema: { type: 'integer' }, required: true }],
            responses: { 204: { description: 'Deletado.' } }
        }
      }
    },
  },
  apis: ['./src/routes/*.ts'], // Se você quiser adicionar comentários JSDoc nos arquivos no futuro
};

export const swaggerSpec = swaggerJsdoc(options);