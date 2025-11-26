import { Request, Response } from 'express';
import restaurantController from "../../controllers/restaurantORM.controller";

// 1. Criar o Mock do QueryBuilder (Necessário pois seu controller usa createQueryBuilder)
const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(), // Retorna o próprio objeto para encadear
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
  getOne: jest.fn(),
};

// 2. Criar o Mock do Repositório
const mockRepository = {
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(), // Adicione outros métodos conforme necessário
};

// 3. Mockar o DataSource para retornar nosso repositório falso
jest.mock('../../data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(() => mockRepository),
    transaction: jest.fn((callback) => callback({ getRepository: () => mockRepository })), // Mock para transações
  },
}));

// 4. Função auxiliar para mockar Request e Response (Igual ao padrão do projeto de referência)
const mockRequestResponse = (reqOverrides: Partial<Request> = {}) => {
  const req: Partial<Request> = {
    params: {},
    body: {},
    ...reqOverrides,
  };

  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(), // Permite encadear .status().json()
    json: jest.fn(),
    sendStatus: jest.fn(), // Adicionado para compatibilidade
    send: jest.fn(),
  };

  return { req: req as Request, res: res as Response };
};

describe('Restaurant Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRestaurants', () => {
    it('deveria retornar uma lista de restaurantes formatada', async () => {
      // Dados simulados que o banco retornaria
      const mockRestaurants = [
        {
          id: 1,
          name: 'Teste Grill',
          kitchenType: 'Churrasco',
          city: 'São Paulo',
          uf: 'SP',
          contact: '11999999999',
          createdAt: new Date(),
          updatedAt: new Date(),
          openingHours: [
            { dayOfWeek: 'monday', opensAt: '10:00', closesAt: '22:00', isActive: true },
          ],
        },
      ];

      // Configura o mock para retornar esses dados quando getMany for chamado
      mockQueryBuilder.getMany.mockResolvedValue(mockRestaurants);

      const { req, res } = mockRequestResponse();

      await restaurantController.getRestaurants(req, res);

      // Verificações
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('restaurant');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      
      // Verifica se a formatação do retorno (map) funcionou
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          name: 'Teste Grill',
          opening: expect.arrayContaining([
            expect.objectContaining({ day: 'monday' })
          ])
        })
      ]));
    });

    it('deveria retornar 404 se não houver restaurantes', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const { req, res } = mockRequestResponse();

      await restaurantController.getRestaurants(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Restaurants not found.' });
    });
  });

  describe('createRestaurant', () => {
    it('deveria criar um restaurante com sucesso', async () => {
      const newRestaurantData = {
        name: 'Novo Restô',
        kitchenType: 'Italiana',
        city: 'Roma',
        uf: 'IT',
        contact: '12345678901',
        opening: [
          { day: 'monday', opensAt: '18:00', closesAt: '23:00' }
        ]
      };

      // Simula a criação da entidade
      const savedEntity = { id: 1, ...newRestaurantData, createdAt: new Date(), updatedAt: new Date() };
      mockRepository.create.mockReturnValue(savedEntity);
      mockRepository.save.mockResolvedValue(savedEntity);

      const { req, res } = mockRequestResponse({ body: newRestaurantData });

      await restaurantController.createRestaurant(req, res);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
});