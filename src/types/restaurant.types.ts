// src/types/restaurant.types.ts

// Interface for the DTO (Payload) - What comes in the POST body
export interface RestaurantPayload {
  name: string;
  kitchenType: string;
  city: string;
  uf: string;
  contact: string;
  weekday: number;
  opensAt: string;
  closesAt: string;
}

// Interface for the full Model (As it exists in the "DB")
export interface Restaurant extends RestaurantPayload {
  id: string;
  isActive: boolean; // Required in the DB
  createdAt: string;
  updatedAt: string;
}

