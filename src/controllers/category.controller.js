import { categoryService } from "../services/category.service.js";

export const categoryController = {
  async list(req, res, next) {
    try {
      const categories = await categoryService.list(req.user);
      return res.status(200).json(categories);
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const category = await categoryService.getById(req.params.id, req.user);
      return res.status(200).json(category);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const category = await categoryService.create(req.body, req.user);
      return res.status(201).json(category);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const category = await categoryService.update(
        req.params.id,
        req.body,
        req.user
      );
      return res.status(200).json(category);
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      await categoryService.remove(req.params.id, req.user);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  },
};
