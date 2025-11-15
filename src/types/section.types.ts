export interface SectionPayload {
    name: string;
    description: string;  
    isActive: boolean; 
}

export interface Sections extends SectionPayload {
    id: string;
    restaurant_id: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}