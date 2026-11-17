import { AppError } from "../middlewares/errorHandler.js";
import { userRepository } from "../repositories/user.repository.js";
import { transactionRepository } from "../repositories/transaction.repository.js";

export const userService = {
  async listAll(requester) {
    if (requester.role !== "ADMIN") {
      throw new AppError("Acesso proibido para este perfil.", 403);
    }

    return userRepository.findAll();
  },

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }
    return user;
  },

  async getUserTransactions(targetUserId, requester) {
    const isOwner = requester.id === targetUserId;
    const isAdmin = requester.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new AppError("Acesso proibido para este perfil.", 403);
    }

    const user = await userRepository.findById(targetUserId);
    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    const transactions = await transactionRepository.findByUserId(targetUserId);
    return { user, transactions };
  },
};
