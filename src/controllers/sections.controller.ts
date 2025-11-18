import { Request, Response } from 'express';
import { sectionRepository } from '../repositories/sections.repository';
import { SectionPayload } from '../types/section.types';
import { ItemPayload } from '../types/item.types';

export const sectionController = {
    findSection: async (req: Request, res: Response) => {
        try{
            const { id } = req.params;
            const section = await sectionRepository.findSection(id);

            if (!section) {
                return res.status(404).json({ message: 'Section not found.' });
            }

            return res.status(200).json(section);
        }
        catch(error){
            return res.status(500).json({ message: 'Internal server error.' }); 
        }
    },

    updateSectionFull: async (req: Request, res: Response) => {
        try{
            const { id } = req.params;
            const body = req.body as Partial<SectionPayload>;

            const section = await sectionRepository.updateSectionFull(id, body);

            if (!section) {
                return res.status(400).json({ message: 'Missing required fields.' });
            }

            return res.status(200).json(section);
        }
        catch(error){
            return res.status(500).json({ message: 'Internal server error.' }); 
        }
    },

    updateSectionPartial: async (req: Request, res: Response) => {
        try{
            const { id } = req.params;
            const body = req.body as Partial<SectionPayload>;

            const section = await sectionRepository.updateSectionPartial(id, body);

            if (!section) {
                return res.status(404).json({ message: 'Section not found.' });
            }

            return res.status(200).json(section);
        }
        catch(error){
            return res.status(500).json({ message: 'Internal server error.' }); 
        }
    },

    deleteSection: async (req: Request, res: Response) => {
        try{
            const { id } = req.params;
            const success = await sectionRepository.deleteSection(id);

            if(!success){
                return res.status(404).json({ message: 'Section not found.' });
            }
            return res.status(204).send();
        }
        catch(error){
            return res.status(500).json({ message: 'Internal server error.' }); 
        }
    },

    findAllItemsOfSection: async (req: Request, res: Response) => {
        try{
            const { id } = req.params;
            const items = await sectionRepository.findAllItemsOfSection(id);

            if(!items){
                return res.status(404).json({ message: 'Items not found.' });
            }

            return res.status(200).json(items);
        }
        catch(error){
            return res.status(500).json({ message: 'Internal server error.' }); 
        }
    },

    createItem: async (req: Request, res: Response) => {
        try{
            const body = req.body as ItemPayload;
            const { id } = req.params;

            const item = await sectionRepository.createItem(body, id);

            if(!item){
                return res.status(404).json({ message: 'Section not found.' });
            }

            return res.status(201).json(item);
        }
        catch(error){
            return res.status(500).json({ message: 'Internal server error.' }); 
        }
    },

};