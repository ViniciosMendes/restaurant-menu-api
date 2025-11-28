import { Request, Response } from 'express';
import sectionsController from '../../controllers/sectionsORM.controller';
import { AppDataSource } from '../../data-source';
import { Section } from '../../models/sections.models';
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
      getRepository: jest.fn((model) => {
        // Return the same mock repository for all models for simplicity,
        // but you could have different mocks for Section and Item if needed.
        return mockRepository;
      }),
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

describe('Sections Controller', () => {
  const mockSectionRepository = AppDataSource.getRepository(Section) as any;
  const mockItemRepository = AppDataSource.getRepository(Item) as any;
  const mockQueryBuilder = mockSectionRepository.createQueryBuilder();

  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure createQueryBuilder returns the mock each time
    mockSectionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockItemRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  describe('getSections', () => {
    it('deveria retornar uma lista de seções', async () => {
      const mockSections = [{ section_id: 1, name: 'Bebidas', description: 'Refrigerantes, sucos, etc.' }];
      mockQueryBuilder.getMany.mockResolvedValue(mockSections);
      const { req, res } = mockRequestResponse({ params: { id: '1' } });
      await sectionsController.getSections(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSections);
    });

    it('deveria retornar 404 se nenhuma seção for encontrada', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
      const { req, res } = mockRequestResponse({ params: { id: '99' } });
      await sectionsController.getSections(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Sections not found.' });
    });
  });

  describe('updateSectionPartial', () => {
    it('deveria atualizar parcialmente uma seção', async () => {
      const existingSection = { section_id: 1, name: 'Old Name', description: 'Old Desc' };
      const updateData = { name: 'New Name' };
      const updatedSection = { ...existingSection, ...updateData };
      mockSectionRepository.findOne.mockResolvedValue(existingSection);
      mockSectionRepository.save.mockResolvedValue(updatedSection);
      const { req, res } = mockRequestResponse({ params: { id: '1' }, body: updateData });
      await sectionsController.updateSectionPartial(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' }));
    });

    it('deveria retornar 404 se a seção não for encontrada', async () => {
      mockSectionRepository.findOne.mockResolvedValue(null);
      const { req, res } = mockRequestResponse({ params: { id: '99' }, body: { name: 'fail' } });
      await sectionsController.updateSectionPartial(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateSectionFull', () => {
    it('deveria atualizar completamente uma seção', async () => {
        const existingSection = { section_id: 1, name: 'Old Name', description: 'Old Desc' };
        const updateData = { name: 'New Full Name', description: 'New Full Desc' };
        const updatedSection = { ...existingSection, ...updateData };
        mockSectionRepository.findOne.mockResolvedValue(existingSection);
        mockSectionRepository.save.mockResolvedValue(updatedSection);
        const { req, res } = mockRequestResponse({ params: { id: '1' }, body: updateData });
        await sectionsController.updateSectionFull(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining(updateData));
    });

    it('deveria retornar 404 se a seção não for encontrada', async () => {
        mockSectionRepository.findOne.mockResolvedValue(null);
        const { req, res } = mockRequestResponse({ params: { id: '99' }, body: { name: 'fail', description: 'fail' } });
        await sectionsController.updateSectionFull(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteSections', () => {
    it('deveria desativar uma seção', async () => {
      const existingSection = { section_id: 1, isActive: true };
      mockSectionRepository.findOne.mockResolvedValue(existingSection);
      const { req, res } = mockRequestResponse({ params: { id: '1' } });
      await sectionsController.deleteSections(req, res);
      expect(mockSectionRepository.save).toHaveBeenCalledWith({ ...existingSection, isActive: false });
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('deveria retornar 404 se a seção a ser deletada não for encontrada', async () => {
      mockSectionRepository.findOne.mockResolvedValue(null);
      const { req, res } = mockRequestResponse({ params: { id: '99' } });
      await sectionsController.deleteSections(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createItem', () => {
    it('deveria criar um item em uma seção', async () => {
      const section = { section_id: 1, isActive: true };
      const newItemData = { name: 'Coca-Cola', description: 'Lata 350ml', price: 5.00 };
      const savedItem = { item_id: 1, ...newItemData, section_id: section.section_id };
      mockSectionRepository.findOne.mockResolvedValue(section);
      mockItemRepository.save.mockResolvedValue(savedItem);
      const { req, res } = mockRequestResponse({ params: { id: '1' }, body: newItemData });
      await sectionsController.createItem(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ item: savedItem });
    });

    it('deveria retornar 400 para um body inválido', async () => {
      mockSectionRepository.findOne.mockResolvedValue({ section_id: 1, isActive: true });
      const { req, res } = mockRequestResponse({ params: { id: '1' }, body: { name: 'bad' } }); // body incompleto
      await sectionsController.createItem(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('findAllItemsOfSection', () => {
    it('deveria retornar todos os itens de uma seção', async () => {
      const mockItems = [{ item_id: 1, name: 'Suco de Laranja', price: 8.00, section_id: 1 }];
      mockQueryBuilder.getMany.mockResolvedValue(mockItems);
      const { req, res } = mockRequestResponse({ params: { id: '1' } });
      await sectionsController.findAllItemsOfSection(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    it('deveria retornar 404 se nenhum item for encontrado', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
      const { req, res } = mockRequestResponse({ params: { id: '1' } });
      await sectionsController.findAllItemsOfSection(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Items not found.' });
    });
  });
});
