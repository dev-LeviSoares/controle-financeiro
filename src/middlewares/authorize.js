import { AppError } from "./errorHandler.js";

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Não autenticado.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Acesso proibido para este perfil.", 403));
    }

    return next();
  };
}
