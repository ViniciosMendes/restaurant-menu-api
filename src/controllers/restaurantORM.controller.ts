import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Restaurant } from '../models/restaurant.models';
import { Section } from '../models/sections.models';
import { RestaurantOpeningHour } from '../models/restaurantopeninghour.models';
import { createRestaurantDTO } from "../dtos/restaurant.dtos";

/**
 * Obtém o repositório da entidade Restaurant.
 */
const restaurantRepository = AppDataSource.getRepository(Restaurant);
const sectionRepository = AppDataSource.getRepository(Section);

/**
 * @description Busca todos os restaurantes.
 * @route GET /restaurants
 */
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
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
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

/**
 * @description Busca um restaurante pelo ID.
 * @route GET /restaurants/:id
 */
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
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
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

/**
 * @description Cria um novo restaurante.
 * @route POST /restaurants
 */
export const createRestaurant = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validação do corpo da requisição
    const data = createRestaurantDTO.parse(req.body);

    if(!data.opening || !data.city || !data.contact || !data.kitchenType || !data.name || !data.uf ||
        typeof data.city !== "string" || typeof data.contact !== "string" || typeof data.kitchenType !== "string" ||
        typeof data.name !== "string" || typeof data.uf !== "string" || data.city.length > 30 ||
        data.contact.length > 11 || data.kitchenType.length > 50 || data.name.length > 20 || data.uf.length > 2
    ){
        return res.status(400).json({ message: "Invalid request body." });
    }

    const result = await AppDataSource.transaction(async (manager) => {
      // ---- SALVAR RESTAURANTE ----
      const restaurant = manager.getRepository(Restaurant).create({
        name: data.name,
        kitchenType: data.kitchenType,
        city: data.city,
        uf: data.uf,
        contact: data.contact,
        isActive: true,
      });

      const savedRestaurant = await manager.getRepository(Restaurant).save(restaurant);

      // ---- CRIAR REGISTROS DE OPENING HOURS ----
      const openingRecords = data.opening.map((item, index) => {
        if (!item.day || !item.opensAt || !item.closesAt) {
          throw new Error(
            `Opening hour at index ${index} is missing required fields (day, opensAt, closesAt)`
          );
        }

        return manager.getRepository(RestaurantOpeningHour).create({
          dayOfWeek: item.day,
          opensAt: item.opensAt,
          closesAt: item.closesAt,
          restaurant: savedRestaurant,
          isActive: true,
        });
      });

      await manager.getRepository(RestaurantOpeningHour).save(openingRecords);

      return { savedRestaurant, openingRecords };
    });

    // ---- RETORNO FORMATADO ----
    return res.status(201).json({
      restaurant: {
        id: result.savedRestaurant.id,
        name: result.savedRestaurant.name,
        kitchenType: result.savedRestaurant.kitchenType,
        city: result.savedRestaurant.city,
        uf: result.savedRestaurant.uf,
        contact: result.savedRestaurant.contact,
        createdAt: result.savedRestaurant.createdAt,
        updatedAt: result.savedRestaurant.updatedAt,
      },
      opening: result.openingRecords.map(o => ({
        day: o.dayOfWeek,
        opensAt: o.opensAt,
        closesAt: o.closesAt,
      })),
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && "issues" in (error as any)) {
      // Erro de validação do Zod
      return res.status(400).json({ message: "Invalid request body.", error });
    }

    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * @description Atualiza um restaurante existente.
 * @route PATCH /restaurants/:id
 */
export const updateRestaurant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);
    const allowedFields = ['name', 'kitchenType', 'city', 'uf', 'contact', 'isActive', 'opening'];

    // Verifica se não há campos extras
    for (const key of Object.keys(req.body)) {
      if (!allowedFields.includes(key)) {
        return res.status(400).json({ message: `Invalid request body.` });
      }
    }

    // -----------------------------
    // ✔ Validação de tamanho
    // -----------------------------
    const sizeLimits: Record<string, number> = {
      name: 20,
      kitchenType: 50,
      city: 30,
      uf: 2,
      contact: 11
    };

    for (const key of Object.keys(req.body)) {
      const value = req.body[key];

      // só valida se for string e se existir
      if (typeof value === "string" && sizeLimits[key] !== undefined) {
        if (value.length > sizeLimits[key]) {
          return res.status(400).json({
            message: `Field '${key}' exceeds maximum length of ${sizeLimits[key]}.`
          });
        }
      }
    }

    const result = await AppDataSource.transaction(async (manager) => {
      // ---- BUSCAR RESTAURANTE ----
      const restaurant = await manager.getRepository(Restaurant).findOne({ where: { id, isActive: true } });
      if (!restaurant) {
        throw new Error('NOT_FOUND');
      }

      // ---- ATUALIZAR CAMPOS ----
      for (const key of Object.keys(req.body)) {
        if (key !== 'opening') {
          (restaurant as any)[key] = req.body[key];
        }
      }

      const updatedRestaurant = await manager.getRepository(Restaurant).save(restaurant);

      // ---- ATUALIZAR HORÁRIOS ----
      if (Array.isArray(req.body.opening)) {
        for (const item of req.body.opening) {
          if (!item.day || !item.opensAt || !item.closesAt) {
            throw new Error('MISSING_OPENING_FIELDS');
          }

          const existing = await manager.getRepository(RestaurantOpeningHour).findOne({
            where: { restaurantId: id, dayOfWeek: item.day },
          });

          if (existing) {
            existing.opensAt = item.opensAt;
            existing.closesAt = item.closesAt;
            await manager.getRepository(RestaurantOpeningHour).save(existing);
          } else {
            const newHour = manager.getRepository(RestaurantOpeningHour).create({
              restaurantId: id,
              dayOfWeek: item.day,
              opensAt: item.opensAt,
              closesAt: item.closesAt,
              isActive: true,
            });
            await manager.getRepository(RestaurantOpeningHour).save(newHour);
          }
        }
      }

      return updatedRestaurant;
    });

    // Busca os horários atualizados
    const restaurantWithHours = await restaurantRepository
      .createQueryBuilder("restaurant")
      .leftJoinAndSelect("restaurant.openingHours", "opening", "opening.isActive = :active", { active: true })
      .where("restaurant.id = :id", { id: result.id })
      .getOne();

    const formatted = {
      id: restaurantWithHours!.id,
      name: restaurantWithHours!.name,
      kitchenType: restaurantWithHours!.kitchenType,
      city: restaurantWithHours!.city,
      uf: restaurantWithHours!.uf,
      contact: restaurantWithHours!.contact,
      createdAt: restaurantWithHours!.createdAt,
      updatedAt: restaurantWithHours!.updatedAt,
      opening: restaurantWithHours!.openingHours.map(o => ({
        day: o.dayOfWeek,
        opensAt: o.opensAt,
        closesAt: o.closesAt,
      })),
    };

    return res.status(200).json(formatted);
  } catch (error: any) {
    console.error(error);
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }
    if (error.message === 'MISSING_OPENING_FIELDS') {
      return res.status(400).json({ message: 'Each opening item must have day, opensAt, and closesAt.' });
    }
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * @description Deleta um restaurante.
 * @route DELETE /restaurants/:id
 */
export const deleteRestaurant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);

    // Busca restaurante ativo
    const restaurant = await restaurantRepository.findOne({ where: { id, isActive: true } });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurante não encontrado ou já inativo.' });
    }

    // Soft delete
    restaurant.isActive = false;
    await restaurantRepository.save(restaurant);

    return res.status(204).send(); // No Content
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const createSectionOfRestaurant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);
    const { name, description} = req.body;

    // Erro se faltar name ou description
    if ( !name || !description ||
        typeof name !== "string" || typeof description !== "string" ||
        name.length > 30 || description.length > 200 ) {
      return res.status(400).json({
        message: "Invalid request body."
      });
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
        restaurantId: section.restaurant_id,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
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
      .where("section.isActive = :active AND section.restaurant_id = :id", { active: true, id })
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