export interface SectionPayload {
    restaurant_id: string;
    name: string;
    description: string;  
    isActive: boolean; 
}

export interface Sections extends SectionPayload {
    id: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}