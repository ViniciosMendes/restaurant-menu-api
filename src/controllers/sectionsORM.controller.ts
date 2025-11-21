// src/repositories/section.repository.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Section } from '../models/sections.models';
import { Item } from '../models/items.models';

const sectionRepository = AppDataSource.getRepository(Section);
const itemRepository = AppDataSource.getRepository(Item);

export const getSections = async (req: Request, res: Response): Promise<Response> => {
    try{
        const id = parseInt(req.params.id);

        const sections = await sectionRepository
        .createQueryBuilder("sections")
        .where("sections.isActive = :active AND sections.section_id = :id", { active: true, id, })
        .orderBy("sections.section_id", "ASC")
        .getMany();

        if(!sections || sections.length === 0)
            return res.status(404).json({ message: 'Sections not found.' });

        return res.status(200).json(sections);
    }catch(error){
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const updateSectionPartial = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);
    const allowedFields = ["name", "description"];

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
      if (typeof value === "string" && sizeLimits[key] !== undefined) {
        if (value.length > sizeLimits[key]) {
          return res.status(400).json({
            message: `Invalid request body.`,
          });
        }
      }
    }

    const result = await AppDataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Section);

      const section = await repo.findOne({
        where: { section_id: id, isActive: true },
      });

      if (!section) throw new Error("NOT_FOUND");

      for (const key of Object.keys(req.body)) {
        (section as any)[key] = req.body[key];
      }

      const updated = await repo.save(section);
      return updated;
    });

    return res.status(200).json(result);

  } catch (error: any) {
    console.error(error);
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Section not found." });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
};


export const updateSectionFull = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);
    const allowedFields = ["name", "description"];

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
      if (typeof value === "string" && sizeLimits[key] !== undefined) {
        if (value.length > sizeLimits[key]) {
          return res.status(400).json({
            message: "Invalid request body.",
          });
        }
      }
    }

    const result = await AppDataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Section);

      const section = await repo.findOne({
        where: { section_id: id, isActive: true },
      });

      if (!section) throw new Error("NOT_FOUND");

      // ✔ PUT = sobrescreve tudo
      section.name = req.body.name ?? "";
      section.description = req.body.description ?? "";

      const updated = await repo.save(section);
      return updated;
    });

    return res.status(200).json(result);

  } catch (error: any) {
    console.error(error);
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Section not found." });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
};


export const deleteSections = async (req: Request, res: Response): Promise<Response> => {
    try{
        const id = parseInt(req.params.id);
        const section = await sectionRepository.findOneBy({ section_id: id, isActive: true });

        if(!section)
            return res.status(404).json({ message: 'Section not found.' });

        section.isActive = false;
        await sectionRepository.save(section);

        return res.status(204).send();
    }catch(error){
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const createItem = async (req: Request, res: Response): Promise<Response> => {
    try{
        const id = parseInt(req.params.id);
        const { name, description, price } = req.body;
        
        if (
            !name ||
            !description ||
            price === undefined ||
            typeof name !== "string" ||
            typeof description !== "string" ||
            typeof price !== "number" ||
            isNaN(price) ||
            price < 0 ||
            name.length > 30 ||
            description.length > 200
        ) {
            return res.status(400).json({ message: 'Invalid request body.' });
        }

        const fixedPrice = Math.floor(price * 100) / 100;

        const item = await itemRepository.save({
            section_id: id,
            name,
            description,
            price: fixedPrice
        });

        return res.status(201).json({
            item: {
                item_id: item.item_id,
                section_id: item.section_id,
                name: item.name,
                description: item.description,
                price: item.price,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            }
        });
    }catch(error){
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const findAllItemsOfSection = async (req: Request, res: Response): Promise<Response> => {
    try{
        const id = parseInt(req.params.id);

        const items = await itemRepository
        .createQueryBuilder("items")
        .where("items.isActive = :active AND items.section_id = :id", { active: true, id, })
        .orderBy("items.item_id", "ASC")
        .getMany();

        if(!items || items.length === 0)
            return res.status(404).json({ message: 'Items not found.' });

        return res.status(200).json(items);
    }catch(error){
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export default {
    getSections,
    updateSectionPartial,
    updateSectionFull,
    deleteSections,
    createItem,
    findAllItemsOfSection,
}