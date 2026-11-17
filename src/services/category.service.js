import { AppError } from "../middlewares/errorHandler.js";
import { categoryRepository } from "../repositories/category.repository.js";

const VALID_TYPES = ["INCOME", "EXPENSE"];

export const categoryService = {
  async list(requester) {
    if (requester.role === "ADMIN") {
      return categoryRepository.findAll();
    }
    return categoryRepository.findByUserId(requester.id);
  },

  async getById(id, requester) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new AppError("Categoria não encontrada.", 404);
    }

    if (requester.role !== "ADMIN" && category.userId !== requester.id) {
      throw new AppError("Acesso proibido a esta categoria.", 403);
    }

    return category;
  },

  async create({ name, type }, requester) {
    if (!name || !type) {
      throw new AppError("Nome e tipo são obrigatórios.", 400);
    }

    if (!VALID_TYPES.includes(type)) {
      throw new AppError("Tipo inválido. Use INCOME ou EXPENSE.", 400);
    }

    try {
      return await categoryRepository.create({
        name: name.trim(),
        type,
        userId: requester.id,
      });
    } catch (error) {
      if (error.code === "P2002") {
        throw new AppError("Já existe uma categoria com este nome e tipo.", 409);
      }
      throw error;
    }
  },

  async update(id, { name, type }, requester) {
    const category = await this.getById(id, requester);

    if (type && !VALID_TYPES.includes(type)) {
      throw new AppError("Tipo inválido. Use INCOME ou EXPENSE.", 400);
    }

    try {
      return await categoryRepository.update(category.id, {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(type !== undefined ? { type } : {}),
      });
    } catch (error) {
      if (error.code === "P2002") {
        throw new AppError("Já existe uma categoria com este nome e tipo.", 409);
      }
      throw error;
    }
  },

  async remove(id, requester) {
    const category = await this.getById(id, requester);
    const linked = await categoryRepository.countTransactions(category.id);

    if (linked > 0) {
      throw new AppError(
        "Não é possível excluir categoria com transações vinculadas.",
        409
      );
    }

    await categoryRepository.delete(category.id);
  },
};
