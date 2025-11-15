// src/routes/sections.routes.ts
import { Router } from 'express';
import { sectionController } from '../controllers/sections.controller';

const router = Router();

// Define as rotas e linka com o controlador
router.get('/:id', sectionController.findSection);
router.put('/:id', sectionController.updateSectionFull);
router.patch('/:id', sectionController.updateSectionPartial);
router.delete('/:id', sectionController.deleteSection);

export default router;
