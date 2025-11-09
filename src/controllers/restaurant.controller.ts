// src/controllers/restaurant.controller.ts
import { Request, Response } from 'express';
import { repository } from '../repositories/restaurant.repository';
import { RestaurantPayload } from '../types/restaurant.types';

export const controller = {
  findAll: async (req: Request, res: Response) => {
    try {
      const restaurants = await repository.findAll();
      return res.status(200).json(restaurants);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  findById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const restaurant = await repository.findById(id);

      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found.' });
      }

      return res.status(200).json(restaurant);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const body = req.body as RestaurantPayload;

      // Basic validation
      if (!body.name || !body.kitchenType) {
        return res
          .status(400)
          .json({ message: 'Missing required fields: name, kitchenType.' });
      }

      const restaurant = await repository.create(body);
      return res.status(201).json(restaurant);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = req.body as Partial<RestaurantPayload>;

      const restaurant = await repository.update(id, body);

      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found.' });
      }

      return res.status(200).json(restaurant);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await repository.remove(id);

      if (!success) {
        return res.status(404).json({ message: 'Restaurant not found.' });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },
};