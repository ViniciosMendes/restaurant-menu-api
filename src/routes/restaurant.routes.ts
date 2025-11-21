import { Router } from 'express';
import controllerORM from '../controllers/restaurantORM.controller';

const router = Router();

router.get('/', controllerORM.getRestaurants);
router.post('/', controllerORM.createRestaurant);
router.get('/:id', controllerORM.getRestaurantById);
router.patch('/:id', controllerORM.updateRestaurant);
router.delete('/:id', controllerORM.deleteRestaurant);
router.get('/:id/sections', controllerORM.findAllSectionsOfRestaurant);
router.post('/:id/sections', controllerORM.createSectionOfRestaurant);

export default router;