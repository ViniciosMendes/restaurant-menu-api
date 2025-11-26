import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Restaurant } from '../models/restaurant.models';
import { Section } from '../models/sections.models';
import { RestaurantOpeningHour } from '../models/restaurantopeninghour.models';
import { createRestaurantDTO, updateRestaurantDTO } from "../dtos/restaurant.dtos";
import { z } from "zod";

const restaurantRepository = AppDataSource.getRepository(Restaurant);
const sectionRepository = AppDataSource.getRepository(Section);

export const getRestaurants = async (req: Request, res: Response): Promise<Response> => {
  try {
    const restaurants = await restaurantRepository
      .createQueryBuilder("restaurant")
      .leftJoinAndSelect(
        "restaurant.openingHours",
        "opening",
        "opening.isActive = :active",
        { active: true }
      )
      .where("restaurant.isActive = :active", { active: true })
      .orderBy("restaurant.id", "ASC")
      .getMany();

    if (!restaurants || restaurants.length === 0) {
      return res.status(404).json({ message: "Restaurants not found." });
    }

    const formatted = restaurants.map(r => ({
      id: r.id,
      name: r.name,
      kitchenType: r.kitchenType,
      city: r.city,
      uf: r.uf,
      contact: r.contact,
      opening: r.openingHours.map(o => ({
        day: o.dayOfWeek,
        opensAt: o.opensAt,
        closesAt: o.closesAt,
      })),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getRestaurantById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);

    const restaurant = await restaurantRepository
      .createQueryBuilder("restaurant")
      .leftJoinAndSelect(
        "restaurant.openingHours",
        "opening",
        "opening.isActive = :active",
        { active: true }
      )
      .where("restaurant.id = :id AND restaurant.isActive = :active", { id, active: true })
      .getOne();

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const formatted = {
      id: restaurant.id,
      name: restaurant.name,
      kitchenType: restaurant.kitchenType,
      city: restaurant.city,
      uf: restaurant.uf,
      contact: restaurant.contact,
      opening: restaurant.openingHours.map(o => ({
        day: o.dayOfWeek,
        opensAt: o.opensAt,
        closesAt: o.closesAt,
      })),
    };

    return res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const createRestaurant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = createRestaurantDTO.parse(req.body);

    const result = await AppDataSource.transaction(async (manager) => {
      const restaurant = manager.getRepository(Restaurant).create({
        name: data.name,
        kitchenType: data.kitchenType,
        city: data.city,
        uf: data.uf,
        contact: data.contact,
        isActive: true,
      });

      const savedRestaurant = await manager.getRepository(Restaurant).save(restaurant);

      const openingRecords = data.opening.map((item) =>
        manager.getRepository(RestaurantOpeningHour).create({
          dayOfWeek: item.day,
          opensAt: item.opensAt,
          closesAt: item.closesAt,
          restaurant: savedRestaurant,
          isActive: true,
        })
      );

      await manager.getRepository(RestaurantOpeningHour).save(openingRecords);

      return { savedRestaurant, openingRecords };
    });

    return res.status(201).json({
      restaurant: {
        id: result.savedRestaurant.id,
        name: result.savedRestaurant.name,
        kitchenType: result.savedRestaurant.kitchenType,
        city: result.savedRestaurant.city,
        uf: result.savedRestaurant.uf,
        contact: result.savedRestaurant.contact,
      },
      opening: result.openingRecords.map((o) => ({
        day: o.dayOfWeek,
        opensAt: o.opensAt,
        closesAt: o.closesAt,
      })),
    });

  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid request body."
      });
    }

    return res.status(500).json({ message: "Internal server error." });
  }
};

export const updateRestaurant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Number(req.params.id);
    const data = updateRestaurantDTO.parse(req.body);

    const result = await AppDataSource.transaction(async (manager) => {
      const repoRestaurant = manager.getRepository(Restaurant);
      const repoOpening = manager.getRepository(RestaurantOpeningHour);

      const restaurant = await repoRestaurant.findOne({
        where: { id, isActive: true },
      });

      if (!restaurant) throw new Error("NOT_FOUND");

      Object.assign(restaurant, data);
      delete (restaurant as any).opening;

      await repoRestaurant.save(restaurant);

      if (data.opening) {
        for (const item of data.opening) {
          const existing = await repoOpening.findOne({
            where: { restaurantId: id, dayOfWeek: item.day },
          });

          if (existing) {
            existing.opensAt = item.opensAt;
            existing.closesAt = item.closesAt;
            await repoOpening.save(existing);
          } else {
            await repoOpening.save(
              repoOpening.create({
                restaurantId: id,
                dayOfWeek: item.day,
                opensAt: item.opensAt,
                closesAt: item.closesAt,
                isActive: true,
              })
            );
          }
        }
      }

      return restaurant;
    });

    const repo = AppDataSource.getRepository(Restaurant);
    const restaurantWithHours = await repo
      .createQueryBuilder("restaurant")
      .leftJoinAndSelect(
        "restaurant.openingHours",
        "opening",
        "opening.isActive = true"
      )
      .where("restaurant.id = :id", { id })
      .getOne();

    return res.status(200).json({
      id: restaurantWithHours!.id,
      name: restaurantWithHours!.name,
      kitchenType: restaurantWithHours!.kitchenType,
      city: restaurantWithHours!.city,
      uf: restaurantWithHours!.uf,
      contact: restaurantWithHours!.contact,
      opening: restaurantWithHours!.openingHours.map((o) => ({
        day: o.dayOfWeek,
        opensAt: o.opensAt,
        closesAt: o.closesAt,
      })),
    });
  } catch (error: any) {
    console.error(error);

    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid request body.", issues: error.issues });
    }

    return res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteRestaurant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);

    const restaurant = await restaurantRepository.findOne({ where: { id, isActive: true } });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurante não encontrado ou já inativo.' });
    }

    restaurant.isActive = false;
    await restaurantRepository.save(restaurant);

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const createSectionOfRestaurant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);
    const { name, description} = req.body;

    if ( !name || !description ||
        typeof name !== "string" || typeof description !== "string" ||
        name.length > 30 || description.length > 200 ) {
      return res.status(400).json({
        message: "Invalid request body."
      });
    }

    const restaurant = await restaurantRepository.findOne({
      where: { id, isActive: true }
    });

    if (!restaurant) {
      return res.status(400).json({ message: "Invalid request body." });
    }

    const section = await sectionRepository.save({
      restaurant_id: id,
      name,
      description});

    return res.status(201).json({
      section: {
        section_id: section.section_id, 
        name: section.name,
        description: section.description,
        restaurantId: section.restaurant_id
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const findAllSectionsOfRestaurant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);

    const sections = await sectionRepository
      .createQueryBuilder("section")
      .innerJoin("section.restaurant", "restaurant")
      .where("section.isActive = :active AND section.restaurant_id = :id", { active: true, id })
      .andWhere("restaurant.isActive = :restaurantActive", { restaurantActive: true })
      .orderBy("section.section_id", "ASC")
      .getMany();

    if(!sections || sections.length === 0){
        return res.status(404).json({ message: "Sections not found." });
    }

    return res.status(200).json(sections);
  }catch(error){
    return res.status(500).json({ message: "Internal server error." });
  }
}

export default {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  createSectionOfRestaurant,
  findAllSectionsOfRestaurant,
};