import { Router } from 'express';
import controllerORM from '../controllers/sectionsORM.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public routes (GET)
router.get('/:id', controllerORM.getSections);
router.get("/:id/items", controllerORM.findAllItemsOfSection);

// Protected routes (POST, PATCH, DELETE, PUT)
router.put('/:id', authMiddleware, controllerORM.updateSectionFull);
router.patch('/:id', authMiddleware, controllerORM.updateSectionPartial);
router.delete('/:id', authMiddleware, controllerORM.deleteSections);
router.post("/:id/items", authMiddleware, controllerORM.createItem);

export default router;
