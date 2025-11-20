// src/routes/restaurant.routes.ts
import { Router } from 'express';
import { controller } from '../controllers/restaurant.controller';
import controllerORM from '../controllers/restaurantORM.controller';

const router = Router();

// Define as rotas e linka com o controlador
// router.get('/', controller.findAll);
// router.post('/', controller.create);
// router.get('/:id', controller.findById);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.remove);

router.get('/', controllerORM.getRestaurants);
router.post('/', controllerORM.createRestaurant);
router.get('/:id', controllerORM.getRestaurantById);
router.patch('/:id', controllerORM.updateRestaurant);
router.delete('/:id', controllerORM.deleteRestaurant);

router.get('/:id/sections', controller.findAllSectionsOfRestaurant);
router.post('/:id/sections', controller.createSectionOfRestaurant);

export default router;