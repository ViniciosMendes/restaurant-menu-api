// src/index.ts
import express from 'express';
import restaurantRoutes from './routes/restaurant.routes';
import sectionsRoutes from './routes/sections.routes';
import itemsRoutes from './routes/item.routes';


// Create the main Express application
const app = express();
const PORT = 3000;
const BASE_URL = '/v1'; // From your documentation

// --- Middlewares ---
// This middleware is essential for your API to understand JSON
// It takes the JSON from the req.body and parses it
app.use(express.json());

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

// --- Server Start ---
// Start listening for requests on the defined PORT
app.listen(PORT, () => {
  console.log(`[SERVER] Running on http://localhost:${PORT}`);
});