import { Router } from 'express';
import { controller } from '../controllers/item.controller';

const router = Router();

router.get("/:id", controller.findItem);
router.put("/:id", controller.updateFullItem);
router.patch("/:id", controller.updatePartialItem);
router.delete("/:id", controller.deleteItem);

export default router;