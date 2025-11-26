import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Restaurant } from '../models/restaurant.models';
import { Section } from '../models/sections.models';
import { Item } from '../models/items.models';

const itemRepository = AppDataSource.getRepository(Item);
const sectionRepository = AppDataSource.getRepository(Section);
const restaurantRepository = AppDataSource.getRepository(Restaurant);

export const findItem = async (req: Request, res: Response): Promise<Response> => { 
    try{
        const id = parseInt(req.params.id);

        const item = await itemRepository.findOneBy({ item_id: id, isActive: true });
        const restaurant = await restaurantRepository.findOne({
          where: { id, isActive: true }
        });
        const section = await sectionRepository.findOne({
          where: { section_id: item?.section_id, isActive: true },
        });

        if(!restaurant || !section || !item)
            return res.status(404).json({ message: 'Item not found.' });

        return res.status(200).json({
            item_id: item.item_id,
            name: item.name,
            description: item.description,
            price: item.price,
            section_id: item.section_id,
        });
    }catch(error){
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const updateItemPartial = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);
    const allowedFields = ["name", "description", "price"];

    for (const key of Object.keys(req.body)) {
      if (!allowedFields.includes(key)) {
        return res.status(400).json({ message: "Invalid request body." });
      }
    }

    const sizeLimits: Record<string, number> = {
      name: 30,
      description: 200,
    };

    for (const key of Object.keys(req.body)) {
      const value = req.body[key];

      if (key === "price") {
        if (typeof value !== "number" || isNaN(value) || value < 0) {
          return res.status(400).json({ message: "Invalid request body." });
        }
      }

      if (typeof value === "string" && sizeLimits[key] !== undefined) {
        if (value.length > sizeLimits[key]) {
          return res.status(400).json({ message: "Invalid request body." });
        }
      }
    }

    const result = await AppDataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Item);

      const item = await repo.findOne({
        where: { item_id: id, isActive: true },
      });

      const restaurant = await restaurantRepository.findOne({
        where: { id, isActive: true }
      });
      const section = await sectionRepository.findOne({
        where: { section_id: item?.section_id, isActive: true },
      });

      if (!item || !restaurant || !section) throw new Error("NOT_FOUND");

      for (const key of Object.keys(req.body)) {
        if (key === "price") {
          item.price = Math.floor(req.body.price * 100) / 100;
        } else {
          (item as any)[key] = req.body[key];
        }
      }

      return await repo.save(item);
    });

    return res.status(200).json({
        item_id: result.item_id,
        name: result.name,
        description: result.description,
        price: result.price,
        section_id: result.section_id,
    });

  } catch (error: any) {
    console.error(error);
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Item not found." });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const updateItemFull = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);
    const allowedFields = ["name", "description", "price"];

    for (const key of Object.keys(req.body)) {
      if (!allowedFields.includes(key)) {
        return res.status(400).json({ message: "Invalid request body." });
      }
    }

    const sizeLimits: Record<string, number> = {
      name: 30,
      description: 200,
    };

    for (const key of Object.keys(req.body)) {
      const value = req.body[key];

      if (key === "price") {
        if (value !== undefined && (typeof value !== "number" || value < 0 || isNaN(value))) {
          return res.status(400).json({ message: "Invalid request body." });
        }
      }

      if (typeof value === "string" && sizeLimits[key] !== undefined) {
        if (value.length > sizeLimits[key]) {
          return res.status(400).json({ message: "Invalid request body." });
        }
      }
    }

    const result = await AppDataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Item);

      const item = await repo.findOne({
        where: { item_id: id, isActive: true },
      });

      const restaurant = await restaurantRepository.findOne({
        where: { id, isActive: true }
      });
      const section = await sectionRepository.findOne({
        where: { section_id: item?.section_id, isActive: true },
      });

      if (!restaurant || !section || !item) throw new Error("NOT_FOUND");

      item.name = req.body.name ?? "";
      item.description = req.body.description ?? "";

      const rawPrice = req.body.price ?? 0;
      item.price = Math.floor(rawPrice * 100) / 100;

      return await repo.save(item);
    });

    return res.status(200).json({
        item_id: result.item_id,
        name: result.name,
        description: result.description,
        price: result.price,
        section_id: result.section_id,
    });

  } catch (error: any) {
    console.error(error);
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Item not found." });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteItem = async (req: Request, res: Response): Promise<Response> => {
    try{
        const id = parseInt(req.params.id);
        const item = await itemRepository.findOneBy({ item_id: id, isActive: true });
        const restaurant = await restaurantRepository.findOne({
          where: { id, isActive: true }
        });
        const section = await sectionRepository.findOne({
          where: { section_id: item?.section_id, isActive: true },
        });

        if(!item || !restaurant || !section){
            return res.status(404).json({ message: 'Item not found.' });
        }

        item.isActive = false;
        await itemRepository.save(item);

        return res.status(204).send();
    }catch(error){
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export default {
    findItem,
    updateItemPartial,
    updateItemFull,
    deleteItem,
}