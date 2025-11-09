// src/repositories/restaurant.repository.ts
import { Restaurant, RestaurantPayload } from '../types/restaurant.types';
import { randomUUID } from 'crypto';

const db: Restaurant[] = [];

export const repository = {
  findAll: async (): Promise<Restaurant[]> => {
    return db.filter((r) => r.isActive === true);
  },

  findById: async (id: string): Promise<Restaurant | null> => {
    const restaurant = db.find((r) => r.id === id && r.isActive === true);
    return restaurant || null;
  },

  create: async (payload: RestaurantPayload): Promise<Restaurant> => {
    const now = new Date().toISOString();

    const newRestaurant: Restaurant = {
      ...payload,
      id: randomUUID(),
      isActive: payload.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    db.push(newRestaurant);
    return newRestaurant;
  },

  update: async (
    id: string,
    payload: Partial<RestaurantPayload>,
  ): Promise<Restaurant | null> => {
    const index = db.findIndex((r) => r.id === id && r.isActive === true);

    if (index === -1) {
      return null;
    }

    const currentRestaurant = db[index];

    const updatedRestaurant: Restaurant = {
      ...currentRestaurant,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    db[index] = updatedRestaurant;
    return updatedRestaurant;
  },

  remove: async (id: string): Promise<boolean> => {
    const index = db.findIndex((r) => r.id === id && r.isActive === true);

    if (index === -1) {
      return false;
    }

    db[index].isActive = false;
    db[index].updatedAt = new Date().toISOString();
    return true;
  },
};