import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Restaurant } from '../models/restaurant.models';
import { RestaurantOpeningHour } from '../models/restaurantopeninghour.models';
import { createRestaurantDTO } from "../dtos/restaurant.dtos";


/**
 * Obtém o repositório da entidade Restaurant.
 */
const restaurantRepository = AppDataSource.getRepository(Restaurant);

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
      isActive: r.isActive,
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
      isActive: restaurant.isActive,
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
        isActive: result.savedRestaurant.isActive,
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
 * @route PUT /restaurants/:id
 */
export const updateRestaurant = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);
    const allowedFields = ['name', 'kitchenType', 'city', 'uf', 'contact', 'isActive', 'opening'];

    // Verifica se não há campos extras
    for (const key of Object.keys(req.body)) {
      if (!allowedFields.includes(key)) {
        return res.status(400).json({ message: `Field "${key}" is not allowed.` });
      }
    }

    const result = await AppDataSource.transaction(async (manager) => {
      // ---- BUSCAR RESTAURANTE ----
      const restaurant = await manager.getRepository(Restaurant).findOne({ where: { id, isActive: true } });
      if (!restaurant) {
        throw new Error('NOT_FOUND'); // tratamos fora da transação
      }

      // ---- ATUALIZAR CAMPOS DO RESTAURANTE ----
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

          // Procura horário existente
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

    // Busca os horários atualizados para retorno
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
      isActive: restaurantWithHours!.isActive,
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

export default {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};