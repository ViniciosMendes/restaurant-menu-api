// src/routes/restaurant.routes.ts
import { Router } from 'express';
import { controller } from '../controllers/restaurant.controller';

const router = Router();

// Define as rotas e linka com o controlador
router.get('/', controller.findAll);
router.post('/', controller.create);
router.get('/:id', controller.findById);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);
router.get('/:id/sections', controller.findAllSectionsOfRestaurant);
router.post('/:id/sections', controller.createSectionOfRestaurant);

export default router;