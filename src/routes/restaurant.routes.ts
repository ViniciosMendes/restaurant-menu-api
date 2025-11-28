import { Router } from 'express';
import controllerORM from '../controllers/restaurantORM.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public routes (GET)
router.get('/', controllerORM.getRestaurants);
router.get('/:id', controllerORM.getRestaurantById);
router.get('/:id/sections', controllerORM.findAllSectionsOfRestaurant);

// Protected routes (POST, PATCH, DELETE)
router.post('/', authMiddleware, controllerORM.createRestaurant);
router.patch('/:id', authMiddleware, controllerORM.updateRestaurant);
router.delete('/:id', authMiddleware, controllerORM.deleteRestaurant);
router.post('/:id/sections', authMiddleware, controllerORM.createSectionOfRestaurant);

export default router;