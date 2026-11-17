import { transactionService } from "../services/transaction.service.js";

export const transactionController = {
  async list(req, res, next) {
    try {
      const transactions = await transactionService.list(req.user);
      return res.status(200).json(transactions);
    } catch (error) {
      return next(error);
    }
  },

  async listMine(req, res, next) {
    try {
      const transactions = await transactionService.listMine(req.user);
      return res.status(200).json(transactions);
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const transaction = await transactionService.getById(
        req.params.id,
        req.user
      );
      return res.status(200).json(transaction);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const transaction = await transactionService.create(req.body, req.user);
      return res.status(201).json(transaction);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const transaction = await transactionService.update(
        req.params.id,
        req.body,
        req.user
      );
      return res.status(200).json(transaction);
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      await transactionService.remove(req.params.id, req.user);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  },
};
