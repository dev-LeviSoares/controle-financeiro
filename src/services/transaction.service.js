import { AppError } from "../middlewares/errorHandler.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { transactionRepository } from "../repositories/transaction.repository.js";

const VALID_TYPES = ["INCOME", "EXPENSE"];

function toNumberAmount(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) {
    throw new AppError("Valor da transação inválido.", 400);
  }
  return value;
}

export const transactionService = {
  async list(requester) {
    if (requester.role === "ADMIN") {
      return transactionRepository.findAll();
    }
    return transactionRepository.findByUserId(requester.id);
  },

  async listMine(requester) {
    return transactionRepository.findByUserId(requester.id);
  },

  async getById(id, requester) {
    const transaction = await transactionRepository.findById(id);
    if (!transaction) {
      throw new AppError("Transação não encontrada.", 404);
    }

    if (requester.role !== "ADMIN" && transaction.userId !== requester.id) {
      throw new AppError("Acesso proibido a esta transação.", 403);
    }

    return transaction;
  },

  async create(payload, requester) {
    const { description, amount, type, categoryId, date } = payload;

    if (!description || amount === undefined || !type || !categoryId) {
      throw new AppError(
        "Descrição, valor, tipo e categoryId são obrigatórios.",
        400
      );
    }

    if (!VALID_TYPES.includes(type)) {
      throw new AppError("Tipo inválido. Use INCOME ou EXPENSE.", 400);
    }

    const numericAmount = toNumberAmount(amount);
    if (numericAmount <= 0) {
      throw new AppError("O valor da transação deve ser maior que zero.", 400);
    }

    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new AppError("Categoria não encontrada.", 404);
    }

    if (requester.role !== "ADMIN" && category.userId !== requester.id) {
      throw new AppError("Acesso proibido a esta categoria.", 403);
    }

    if (category.type !== type) {
      throw new AppError(
        "O tipo da transação deve coincidir com o tipo da categoria.",
        400
      );
    }

    return transactionRepository.create({
      description: description.trim(),
      amount: numericAmount,
      type,
      categoryId,
      userId: requester.id,
      ...(date ? { date: new Date(date) } : {}),
    });
  },

  async update(id, payload, requester) {
    const transaction = await this.getById(id, requester);
    const { description, amount, type, categoryId, date } = payload;

    let nextType = type ?? transaction.type;
    let nextCategoryId = categoryId ?? transaction.categoryId;

    if (type && !VALID_TYPES.includes(type)) {
      throw new AppError("Tipo inválido. Use INCOME ou EXPENSE.", 400);
    }

    let numericAmount;
    if (amount !== undefined) {
      numericAmount = toNumberAmount(amount);
      if (numericAmount <= 0) {
        throw new AppError("O valor da transação deve ser maior que zero.", 400);
      }
    }

    if (categoryId || type) {
      const category = await categoryRepository.findById(nextCategoryId);
      if (!category) {
        throw new AppError("Categoria não encontrada.", 404);
      }

      if (requester.role !== "ADMIN" && category.userId !== requester.id) {
        throw new AppError("Acesso proibido a esta categoria.", 403);
      }

      if (category.type !== nextType) {
        throw new AppError(
          "O tipo da transação deve coincidir com o tipo da categoria.",
          400
        );
      }
    }

    return transactionRepository.update(transaction.id, {
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(numericAmount !== undefined ? { amount: numericAmount } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(date !== undefined ? { date: new Date(date) } : {}),
    });
  },

  async remove(id, requester) {
    const transaction = await this.getById(id, requester);
    await transactionRepository.delete(transaction.id);
  },
};
