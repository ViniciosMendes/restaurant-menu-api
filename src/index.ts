// src/index.ts
// A IMPORTAÇÃO MAIS IMPORTANTE: Deve ser a primeira de todas.
import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './data-source'; // Importe o AppDataSource
import restaurantRoutes from './routes/restaurant.routes';
import sectionsRoutes from './routes/sections.routes';
import itemsRoutes from './routes/item.routes';
import dotenv from 'dotenv';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

dotenv.config();

// Create the main Express application
const app = express();
const PORT = 3000;
const BASE_URL = '/v1'; // From your documentation

// --- Middlewares ---
// This middleware is essential for your API to understand JSON
// It takes the JSON from the req.body and parses it
app.use(express.json());

// --- ROTA DA DOCUMENTAÇÃO ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// ---------------------------

// --- Routes ---
// Health check route just to see if the API is up
app.get(BASE_URL, (req, res) => {
  res.status(200).json({
    message: `API is running. Use ${BASE_URL}/restaurants`,
  });
});

// Main resource route
// Connects the URL '/v1/restaurants' to the router file we created
app.use(`${BASE_URL}/restaurants`, restaurantRoutes);
// Connects the URL '/v1/sections' to the router file we created
app.use(`${BASE_URL}/sections`, sectionsRoutes);
// Connects the URL '/v1/items' to the router file we created
app.use(`${BASE_URL}/items`, itemsRoutes);


// FOI COMENTADO APENAS PARA O TESTE DO SWAGGER, SEM O DOCKER
// DEVERÁ SER DESCOMENTADO PARA QUE FUNCIONE O DOCKER/BANCO

// --- Server Start ---
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    // Start listening for requests on the defined PORT
    app.listen(PORT, () => {
      console.log(`[SERVER] Running on http://localhost:${PORT}`);
      console.log(`[DOCS] Swagger disponível em: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
    process.exit(1); // Encerra a aplicação se a conexão com o DB falhar
  });
