export interface SectionPayload {
    name: string;
    description: string;  
}

export interface Sections extends SectionPayload {
    id: string;
    restaurant_id: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}