import { Request, Response } from 'express';
import restaurantController from "../../controllers/restaurantORM.controller";
import { AppDataSource } from '../../data-source';
import { Restaurant } from '../../models/restaurant.models';

// --- MOCK FACTORY (Blindado contra Hoisting) ---
jest.mock('../../data-source', () => {
  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({}),
    getMany: jest.fn(),
    getOne: jest.fn(),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  return {
    AppDataSource: {
      // Retorna sempre o mesmo mock, não importa qual entidade seja pedida
      getRepository: jest.fn(() => mockRepository),
      transaction: jest.fn((callback) => callback({ getRepository: () => mockRepository })),
    },
  };
});

// --- HELPER ---
const mockRequestResponse = (reqOverrides: Partial<Request> = {}) => {
  const req: Partial<Request> = {
    params: {},
    body: {},
    ...reqOverrides,
  };

  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    sendStatus: jest.fn(),
    send: jest.fn(),
  };

  return { req: req as Request, res: res as Response };
};

describe('Restaurant Controller', () => {
  // Acessa os mocks através do objeto mockado para garantir referência correta
  const mockRepository = AppDataSource.getRepository({} as any) as any;
  const mockQueryBuilder = mockRepository.createQueryBuilder();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  // --- GET ---
  describe('getRestaurants', () => {
    it('deveria retornar lista formatada', async () => {
      const mockRestaurants = [{
        id: 1,
        name: 'Teste Grill',
        kitchenType: 'Churrasco',
        openingHours: [{ dayOfWeek: 'monday', opensAt: '10:00', closesAt: '22:00' }],
      }];
      mockQueryBuilder.getMany.mockResolvedValue(mockRestaurants);

      const { req, res } = mockRequestResponse();
      await restaurantController.getRestaurants(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ name: 'Teste Grill' })
      ]));
    });
  });

  describe('getRestaurantById', () => {
    it('deveria retornar um restaurante se encontrado', async () => {
      const mockRestaurant = {
        id: 1,
        name: 'Teste Grill',
        openingHours: []
      };
      mockQueryBuilder.getOne.mockResolvedValue(mockRestaurant);

      const { req, res } = mockRequestResponse({ params: { id: '1' } });
      await restaurantController.getRestaurantById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });

    it('deveria retornar 404 se não encontrar', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      const { req, res } = mockRequestResponse({ params: { id: '99' } });
      await restaurantController.getRestaurantById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // --- CREATE ---
  describe('createRestaurant', () => {
    it('deveria criar restaurante com sucesso', async () => {
      const body = {
        name: 'Novo',
        kitchenType: 'Italiana',
        city: 'Roma',
        uf: 'IT',
        contact: '12345678901',
        opening: [{ day: 'monday', opensAt: '18:00', closesAt: '23:00' }]
      };
      
      const saved = { id: 1, ...body };
      mockRepository.create.mockReturnValue(saved);
      mockRepository.save.mockResolvedValue(saved);

      const { req, res } = mockRequestResponse({ body });
      await restaurantController.createRestaurant(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // --- UPDATE ---
  describe('updateRestaurant', () => {
    it('deveria atualizar um restaurante com sucesso', async () => {
      const body = { name: 'Restaurante Atualizado' };
      const existingRestaurant = { id: 1, name: 'Antigo', isActive: true };
      
      // 1. Encontra o restaurante
      mockRepository.findOne.mockResolvedValue(existingRestaurant);
      // 2. Salva
      mockRepository.save.mockResolvedValue({ ...existingRestaurant, ...body });
      // 3. Retorna atualizado (getOne no final do controller)
      mockQueryBuilder.getOne.mockResolvedValue({ ...existingRestaurant, ...body, openingHours: [] });

      const { req, res } = mockRequestResponse({ params: { id: '1' }, body });

      await restaurantController.updateRestaurant(req, res);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deveria retornar 404 se restaurante não existir para update', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const { req, res } = mockRequestResponse({ params: { id: '99' }, body: { name: 'X' } });
      await restaurantController.updateRestaurant(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // --- DELETE ---
  describe('deleteRestaurant', () => {
    it('deveria realizar soft delete com sucesso', async () => {
      const restaurant = { id: 1, isActive: true };
      mockRepository.findOne.mockResolvedValue(restaurant);
      
      const { req, res } = mockRequestResponse({ params: { id: '1' } });

      await restaurantController.deleteRestaurant(req, res);

      // Verifica se o restaurante foi desativado
      expect(restaurant.isActive).toBe(false);
      expect(mockRepository.save).toHaveBeenCalledWith(restaurant);
      // Verifica se os itens/seções também foram desativados (QueryBuilder update)
      expect(mockQueryBuilder.update).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('deveria retornar 404 se não encontrar para deletar', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const { req, res } = mockRequestResponse({ params: { id: '99' } });
      await restaurantController.deleteRestaurant(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // --- SECTIONS ---
  describe('createSectionOfRestaurant', () => {
    it('deveria criar seção se restaurante existir', async () => {
      const body = { name: 'Bebidas', description: 'Geladas' };
      mockRepository.findOne.mockResolvedValue({ id: 1 }); // Restaurante existe
      mockRepository.save.mockResolvedValue({ section_id: 10, restaurant_id: 1, ...body });

      const { req, res } = mockRequestResponse({ params: { id: '1' }, body });

      await restaurantController.createSectionOfRestaurant(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        section: expect.objectContaining({ name: 'Bebidas' })
      }));
    });
  });

  describe('findAllSectionsOfRestaurant', () => {
    it('deveria listar seções', async () => {
      const sections = [{ section_id: 1, name: 'Bebidas' }];
      mockQueryBuilder.getMany.mockResolvedValue(sections);

      const { req, res } = mockRequestResponse({ params: { id: '1' } });

      await restaurantController.findAllSectionsOfRestaurant(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(sections);
    });
  });
});