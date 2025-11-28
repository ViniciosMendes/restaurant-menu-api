import { Router } from 'express';
import controllerORM from '../controllers/itemsORM.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public routes (GET)
router.get("/:id", controllerORM.findItem);

// Protected routes (PATCH, DELETE, PUT)
router.put("/:id", authMiddleware, controllerORM.updateItemFull);
router.patch("/:id", authMiddleware, controllerORM.updateItemPartial);
router.delete("/:id", authMiddleware, controllerORM.deleteItem);

export default router;