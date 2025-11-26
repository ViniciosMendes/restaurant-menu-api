import { Restaurant } from "../../models/restaurant.models";

describe('Restaurant model', () => {
    it('deveria criar uma instancia de restaurante', () => {
        // Instancia a classe e define as propriedades
        const restaurant = new Restaurant();
        restaurant.name = 'Sabor Latino';
        restaurant.kitchenType = 'Brasileira';
        restaurant.city = 'São Paulo';
        restaurant.uf = 'SP';
        restaurant.contact = '11999999999';

        // Verifica se os valores foram atribuídos corretamente (Padrão do projeto de referência)
        expect(restaurant.name).toBe('Sabor Latino');
        expect(restaurant.kitchenType).toBe('Brasileira');
        expect(restaurant.city).toBe('São Paulo');
        expect(restaurant.uf).toBe('SP');
        expect(restaurant.contact).toBe('11999999999');

        // Verifica se o ID inicia indefinido (pois é gerado pelo banco)
        expect(restaurant.id).toBeUndefined();
    });

    it('deveria alterar a propriedade id', () => {
        const restaurant = new Restaurant();
        restaurant.name = 'Restaurante Teste';
        
        // Simula a atribuição de um ID (como se tivesse vindo do banco)
        restaurant.id = 999;

        expect(restaurant.id).toBe(999);
        expect(restaurant.name).toBe('Restaurante Teste');
    });
});