import { Items, ItemPayload } from "../types/item.types";

export const db_i: Items[] = []; // Banco em memória

export const itemRepository = {
    findItem: async (id: string): Promise<Items | null> => {
        const item = db_i.find((r) => r.id === id && r.isActive === true);
        return item || null;
    },

    // Aqui contém um erro, onde o PUT deve atualizar todos os campos que são obrigatórios
    // e caso esse campo seja vazio, ele deve ser atualizado com null.
    updateItemFull: async (id: string, payload: Partial<Pick<ItemPayload, "name" | "description" | "price">>): Promise<Items | null> => {
        const index = db_i.findIndex(i => i.id === id && i.isActive === true);
        if (index === -1) return null;

        const currentItem = db_i[index];
        const updatedItem: Items = {
            ...currentItem,
            name: payload.name ?? currentItem.name,
            description: payload.description ?? currentItem.description,
            price: payload.price ?? currentItem.price,
            updatedAt: new Date().toISOString(),
        };

        if (!updatedItem.name || !updatedItem.description || !updatedItem.price ||
            typeof updatedItem.name !== "string" ||
            typeof updatedItem.description !== "string" ||
            typeof updatedItem.price !== "number"
        ) {
            return null;
        }

        db_i[index] = updatedItem;
        return updatedItem;
    },

    updateItemPartial: async (id: string, payload: Partial<Pick<ItemPayload, "name" | "description" | "price">>): Promise<Items | null> => {
        const index = db_i.findIndex((i) => i.id === id && i.isActive === true);
    
        if (index === -1) {
            return null;
        }

        const currentItem = db_i[index];
        const filteredPayload = Object.fromEntries(
            Object.entries(payload).filter(([key, value]) => {
                if (value === "" || value === null || value === undefined) {
                    return false;
                }

                if (key === "price") {
                    return typeof value === "number" && !isNaN(value);
                }

                if (typeof value !== "string") {
                    return false;
                }

                if (["isActive", "id", "createdAt", "updatedAt", "restaurant_id", "section_id"].includes(key)) {
                    return false;
                }

                return true;
            })
        );

        const updateItem: Items = {
            ...currentItem,
            ...filteredPayload,
            updatedAt: new Date().toISOString(),
        };

        db_i[index] = updateItem;
        return updateItem;
    },
    
    deleteItem: async (id: string): Promise<boolean> => {
        const index = db_i.findIndex((i) => i.id === id && i.isActive === true);
        if (index === -1) {
            return false;
        }

        db_i[index].isActive = false;
        db_i[index].updatedAt = new Date().toISOString();
        return true;
    },
    

}