import { Request, Response } from 'express';
import { itemRepository } from '../repositories/item.repository';
import { ItemPayload } from '../types/item.types';

export const controller = {
    findItem: async (req: Request, res: Response) => {
        try{
            const { id } = req.params;
            const item = await itemRepository.findItem(id);

            if(!item){
                return res.status(404).json({ message: 'Item not found.' });
            }

            return res.status(200).json(item);
        }catch(error){
            return res.status(500).json({ message: 'Internal server error.' });
        }
    },

    updatePartialItem: async (req: Request, res: Response) => {
        try{
            const { id } = req.params;
            const body = req.body as Partial<ItemPayload>;
            const item  = await itemRepository.updateItemPartial(id, body);

            if(!item){
                return res.status(400).json({ message: 'Missing required fields.' });
            }
            
            return res.status(200).json(item);
        }catch(error){
            return res.status(500).json({ message: 'Internal server error.' });
        
        }
    },

    updateFullItem: async (req: Request, res: Response) => {
        try{
            const { id } = req.params;
            const body = req.body as ItemPayload;
            const item = await itemRepository.updateItemFull(id, body);

            if(!item){
                return res.status(400).json({ message: 'Missing required fields.' });
            }

            return res.status(200).json(item);
        }catch(error){
            return res.status(500).json({ message: 'Internal server error.' });
        }
    },

    deleteItem: async (req: Request, res: Response) => {
        try{
            const { id } = req.params;
            const item = await itemRepository.deleteItem(id);

            if(!item){
                return res.status(404).json({ message: 'Item not found.' });
            }

            return res.status(200).json(item);
        }catch(error){
            return res.status(500).json({ message: 'Internal server error.' });
        }
    },
}