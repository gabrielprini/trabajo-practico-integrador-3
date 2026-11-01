import { body, param } from "express-validator";
import User from "../../models/user.js";
import { profileRules } from "./auth.validation.js";

export const userIdValidation = [
  param("id").isMongoId().withMessage("El ID del usuario no es válido"),
];

export const updateUserValidation = [
  // Reutilizamos la validación del ID del usuario.
  ...userIdValidation,

  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("El username debe tener entre 3 y 20 caracteres")
    .isAlphanumeric()
    .withMessage("El username solo puede tener letras y números")

    // Comprobamos que el username no esté siendo utilizado por otro usuario.
    .custom(async (value, { req }) => {
      // Buscamos un usuario que tenga ese username,
      // excluyendo al usuario que estamos actualizando.
      const exists = await User.findOne({
        username: value,
        _id: { $ne: req.params.id },
      });

      if (exists) {
        throw new Error("El username ya está en uso");
      }

      return true;
    }),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("El email no tiene un formato válido")
    .normalizeEmail() // Normaliza el formato del correo electrónico.

    // Comprobamos que el email no esté registrado por otro usuario.
    .custom(async (value, { req }) => {
      // Buscamos un usuario con ese email,
      // excluyendo al usuario que estamos actualizando.
      const exists = await User.findOne({
        email: value,
        _id: { $ne: req.params.id },
      });

      if (exists) {
        throw new Error("El email ya está registrado");
      }

      return true;
    }),

  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/[a-z]/)
    .withMessage("La contraseña debe tener al menos una minúscula")
    .matches(/[A-Z]/)
    .withMessage("La contraseña debe tener al menos una mayúscula")
    .matches(/\d/)
    .withMessage("La contraseña debe tener al menos un número"),

  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("El rol debe ser 'user' o 'admin'"),

  // profileRules(false) permite actualizar los campos del perfil sin exigir que se envíen todos.
  ...profileRules(false),
];
