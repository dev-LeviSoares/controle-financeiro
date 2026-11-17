import { userService } from "../services/user.service.js";

export const userController = {
  async list(req, res, next) {
    try {
      const users = await userService.listAll(req.user);
      return res.status(200).json(users);
    } catch (error) {
      return next(error);
    }
  },

  async getTransactions(req, res, next) {
    try {
      const data = await userService.getUserTransactions(req.params.id, req.user);
      return res.status(200).json(data);
    } catch (error) {
      return next(error);
    }
  },
};
