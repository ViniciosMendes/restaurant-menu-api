import { Sections, SectionPayload } from "../types/section.types";
import { Items, ItemPayload } from "../types/item.types";
import { db_i } from "../repositories/item.repository";
import { randomUUID } from 'crypto';

export const db_s: Sections[] = []; // Banco em memória

export const sectionRepository = {
    findSection: async (id: string): Promise<Sections | null> => {
        const section = db_s.find((s) => s.id === id && s.isActive === true);
        return section || null;
    },

    updateSectionFull: async (
        id: string,
        payload: Partial<Pick<SectionPayload, "name" | "description">>
    ): Promise<Sections | null> => {
        
        const index = db_s.findIndex(s => s.id === id && s.isActive === true);
        if (index === -1) return null;

        const currentSection = db_s[index];

        const updatedSection: Sections = {
            ...currentSection,
            name: payload.name ?? currentSection.name,
            description: payload.description ?? currentSection.description,
            updatedAt: new Date().toISOString(),
        };

        if (!updatedSection.name || !updatedSection.description ||
            typeof updatedSection.name !== "string" ||
            typeof updatedSection.description !== "string"
        ) {
            return null;
        }

        db_s[index] = updatedSection;
        return updatedSection;
    },

    updateSectionPartial: async (id: string, payload: Partial<Pick<SectionPayload, 'name' | 'description'>>): Promise<Sections | null> => {
        const index = db_s.findIndex((s) => s.id === id && s.isActive === true);

        if (index === -1) {
            return null;
        }

        const currentSection = db_s[index];
        const filteredPayload = Object.fromEntries(
            Object.entries(payload).filter(([key, value]) => {
                if (value === "" || value === null || value === undefined) {
                    return false;
                }

                if (typeof value !== "string") {
                    return false;
                }

                if (["isActive", "id", "createdAt", "updatedAt", "restaurant_id"].includes(key)) {
                    return false;
                }

                return true;
            })
        );

         const updatedSection: Sections = {
            ...currentSection,
            ...filteredPayload,
            updatedAt: new Date().toISOString(),
        };

        db_s[index] = updatedSection;
        return updatedSection;
    },

    deleteSection: async (id: string): Promise<boolean> => {
        const index = db_s.findIndex((s) => s.id === id && s.isActive === true);

        if (index === -1) {
            return false;
        }

        db_s[index].isActive = false;
        db_s[index].updatedAt = new Date().toISOString();
        return true;
    },

    findAllItemsOfSection: async (section_id: string): Promise<Items[] | null> => {
        const section = await sectionRepository.findSection(section_id);
        if (!section) {
            return null;
        }

        return db_i.filter((i) => i.section_id === section_id && i.isActive === true);
    },

    createItem: async (payload: ItemPayload, section_id: string): Promise<Items | null> => {
        const section = await sectionRepository.findSection(section_id);
        if (!section) {
            return null;
        }

        if (typeof payload.price !== "number" || Number.isNaN(payload.price ||
            typeof payload.name !== "string" || typeof payload.description !== "string" ||
            !payload.name || !payload.description || !payload.price
        )) {
            return null; 
        }

        const filteredPayload = Object.fromEntries(
        Object.entries(payload).filter(([key, value]) => {
            return  value !== "" && value !== null && value !== undefined &&
                key !== "isActive" && key !== "id" && key !== "createdAt" && key !== "updatedAt" && key !== "restaurant_id" && key !== "section_id";
            })
        );

        const now = new Date().toISOString();
        const newItem: Items = {
            ...payload,
            restaurant_id: section.restaurant_id,
            section_id: section_id,
            id: randomUUID(),
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };
        
        db_i.push(newItem);
        return newItem;
    },   
}