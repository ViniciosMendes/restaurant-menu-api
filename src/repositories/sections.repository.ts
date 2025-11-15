import { Sections, SectionPayload } from "../types/section.types";

export const db_s: Sections[] = []; // Banco em memória

export const sectionRepository = {
    findSection: async (id: string): Promise<Sections | null> => {
        const section = db_s.find((s) => s.id === id && s.isActive === true);
        return section || null;
    },

    updateSectionFull: async (id: string, payload: Partial<SectionPayload>): Promise<Sections | null> => {
        const index = db_s.findIndex((s) => s.id === id && s.isActive === true);

        if (index === -1) {
            return null;
        }

        const currentSection = db_s[index];
        const merged = {
            ...currentSection,
            ...payload,
        };

        if (
            !merged.name ||
            !merged.description ||
            merged.isActive === undefined
        ) {
            return null;
        }

        const updatedSection: Sections = {
            ...merged,
            updatedAt: new Date().toISOString(),
        };

        db_s[index] = updatedSection;
        return updatedSection;
    },

    updateSectionPartial: async (id: string, payload: Partial<SectionPayload>): Promise<Sections | null> => {
        const index = db_s.findIndex((s) => s.id === id && s.isActive === true);

        if (index === -1) {
            return null;
        }

        const currentSection = db_s[index];
        const filteredPayload = Object.fromEntries(
            Object.entries(payload).filter(([_, value]) => {
                return value !== "" && value !== null && value !== undefined;
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
}