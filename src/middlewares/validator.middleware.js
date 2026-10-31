// permite obtener los errores que se encontraron durante las validaciones anteriores.
import { validationResult } from "express-validator";

export const validator = (req, res, next) => {
  const errors = validationResult(req);

  // isEmpty comprueba si la lista de errores está vacía.
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Errores de validación",
      errors: errors.array(),
    });
  }

  next();
};
