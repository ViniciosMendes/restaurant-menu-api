// src/routes/sections.routes.ts
import { Router } from 'express';
import { sectionController } from '../controllers/sections.controller';
import controllerORM from '../controllers/sectionsORM.controller';

const router = Router();

// Define as rotas e linka com o controlador
router.get('/:id', controllerORM.getSections);
router.put('/:id', controllerORM.updateSectionFull);
router.patch('/:id', controllerORM.updateSectionPartial);
router.delete('/:id', controllerORM.deleteSections);
router.get("/:id/items", controllerORM.findAllItemsOfSection);
router.post("/:id/items", controllerORM.createItem);

export default router;
