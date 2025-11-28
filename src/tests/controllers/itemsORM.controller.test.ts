import { Request, Response } from 'express';
import itemsController from '../../controllers/itemsORM.controller';
import { AppDataSource } from '../../data-source';
import { Item } from '../../models/items.models';

// Mocking the data source
jest.mock('../../data-source', () => {
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  return {
    AppDataSource: {
      getRepository: jest.fn(() => mockRepository),
      transaction: jest.fn((callback) => callback({ getRepository: () => mockRepository })),
    },
  };
});

// Helper function for mock request/response
const mockRequestResponse = (reqOverrides: Partial<Request> = {}) => {
  const req: Partial<Request> = {
    params: {},
    body: {},
    ...reqOverrides,
  };

  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  };

  return { req: req as Request, res: res as Response };
};

describe('Items Controller', () => {
  const mockItemRepository = AppDataSource.getRepository(Item) as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findItem', () => {
    it('deveria retornar um item', async () => {
      const mockItem = { item_id: 1, name: 'Pizza', price: 50.00 };
      mockItemRepository.findOne.mockResolvedValue(mockItem);
      const { req, res } = mockRequestResponse({ params: { id: '1' } });
      await itemsController.findItem(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it('deveria retornar 404 se o item não for encontrado', async () => {
      mockItemRepository.findOne.mockResolvedValue(null);
      const { req, res } = mockRequestResponse({ params: { id: '99' } });
      await itemsController.findItem(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Item not found.' });
    });
  });

  describe('updateItemPartial', () => {
    it('deveria atualizar parcialmente um item', async () => {
      const existingItem = { item_id: 1, name: 'Old Name', price: 10 };
      const updateData = { price: 15 };
      const updatedItem = { ...existingItem, ...updateData };
      mockItemRepository.findOne.mockResolvedValue(existingItem);
      mockItemRepository.save.mockResolvedValue(updatedItem);
      const { req, res } = mockRequestResponse({ params: { id: '1' }, body: updateData });
      await itemsController.updateItemPartial(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ price: 15 }));
    });

    it('deveria retornar 404 se o item não for encontrado', async () => {
      mockItemRepository.findOne.mockResolvedValue(null);
      const { req, res } = mockRequestResponse({ params: { id: '99' }, body: { price: 20 } });
      await itemsController.updateItemPartial(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deveria retornar 400 para um campo inválido', async () => {
      const { req, res } = mockRequestResponse({ params: { id: '1' }, body: { invalidField: 'valor' } });
      await itemsController.updateItemPartial(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid request body.' });
    });
  });

  describe('updateItemFull', () => {
    it('deveria atualizar completamente um item', async () => {
        const existingItem = { item_id: 1, name: 'Old', description: 'Old', price: 10 };
        const updateData = { name: 'New Full Name', description: 'New Full Desc', price: 50 };
        const updatedItem = { ...existingItem, ...updateData };
        mockItemRepository.findOne.mockResolvedValue(existingItem);
        mockItemRepository.save.mockResolvedValue(updatedItem);
        const { req, res } = mockRequestResponse({ params: { id: '1' }, body: updateData });
        await itemsController.updateItemFull(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining(updateData));
    });

    it('deveria retornar 404 se o item não for encontrado', async () => {
        mockItemRepository.findOne.mockResolvedValue(null);
        const { req, res } = mockRequestResponse({ params: { id: '99' }, body: { name: 'fail', description: 'fail', price: 0 } });
        await itemsController.updateItemFull(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteItem', () => {
    it('deveria desativar um item', async () => {
      const existingItem = { item_id: 1, isActive: true };
      mockItemRepository.findOne.mockResolvedValue(existingItem);
      const { req, res } = mockRequestResponse({ params: { id: '1' } });
      await itemsController.deleteItem(req, res);
      expect(mockItemRepository.save).toHaveBeenCalledWith({ ...existingItem, isActive: false });
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('deveria retornar 404 se o item a ser deletado não for encontrado', async () => {
      mockItemRepository.findOne.mockResolvedValue(null);
      const { req, res } = mockRequestResponse({ params: { id: '99' } });
      await itemsController.deleteItem(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
