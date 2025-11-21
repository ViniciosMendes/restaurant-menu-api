import { Router } from 'express';
import controllerORM from '../controllers/itemsORM.controller';

const router = Router();

router.get("/:id", controllerORM.findItem);
router.put("/:id", controllerORM.updateItemFull);
router.patch("/:id", controllerORM.updateItemPartial);
router.delete("/:id", controllerORM.deleteItem);

export default router;