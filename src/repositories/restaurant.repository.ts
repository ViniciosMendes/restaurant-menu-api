// src/repositories/restaurant.repository.ts
import { Restaurant, RestaurantPayload } from '../types/restaurant.types';
import { Sections, SectionPayload } from "../types/section.types";
import { randomUUID } from 'crypto';

const db_r: Restaurant[] = [];
const db_s: Sections[] = []; // Banco em memória

export const restaurantRepository = {
  findAll: async (): Promise<Restaurant[]> => {
    return db_r.filter((r) => r.isActive === true);
  },

  findById: async (id: string): Promise<Restaurant | null> => {
    const restaurant = db_r.find((r) => r.id === id && r.isActive === true);
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

    db_r.push(newRestaurant);
    return newRestaurant;
  },

  update: async (
    id: string,
    payload: Partial<RestaurantPayload>,
  ): Promise<Restaurant | null> => {
    const index = db_r.findIndex((r) => r.id === id && r.isActive === true);

    if (index === -1) {
      return null;
    }

    const currentRestaurant = db_r[index];

    const updatedRestaurant: Restaurant = {
      ...currentRestaurant,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    db_r[index] = updatedRestaurant;
    return updatedRestaurant;
  },

  remove: async (id: string): Promise<boolean> => {
    const index = db_r.findIndex((r) => r.id === id && r.isActive === true);

    if (index === -1) {
      return false;
    }

    db_r[index].isActive = false;
    db_r[index].updatedAt = new Date().toISOString();
    return true;
  },

  findAllSectionsOfRestaurant: async (
    restaurant_id: string
  ): Promise<Sections[] | null> => {
    const restaurant = await restaurantRepository.findById(restaurant_id);
    if (!restaurant) {
      return null;
    }

    return db_s.filter(
      (s) => s.restaurant_id === restaurant_id && s.isActive === true
    );
  },

  createSectionOfRestaurant: async (payload: SectionPayload, restaurant_id : string): Promise<Sections | null> => {
    const restaurant = await restaurantRepository.findById(restaurant_id);
    if (!restaurant) {
      return null;
    }

    const now = new Date().toISOString();

    const newSection: Sections = {
      ...payload,
      restaurant_id: restaurant_id,
      id: randomUUID(),
      isActive: payload.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    db_s.push(newSection);
    return newSection;
  },
};