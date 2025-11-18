export interface ItemPayload {
    name: string;
    description: string;  
    price: number;
}

export interface Items extends ItemPayload {
    id: string;
    restaurant_id: string;
    section_id: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}