// Importamos body para validar datos del cuerpo de la solicitud (req.body)
// e importamos param para validar parámetros que llegan en la URL.
import { body, param } from "express-validator";

// Importamos el modelo Category para consultar las categorías en MongoDB.
import Category from "../../models/category.js";

export const categoryIdValidation = [
  // Comprobamos que el parámetro "id" de la URL tenga un formato válido de MongoDB.
  param("id").isMongoId().withMessage("El ID de la categoría no es válido"),
];

export const createCategoryValidation = [
  // Validamos el nombre de la categoría.
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 30 })
    .withMessage("El nombre debe tener entre 2 y 30 caracteres")

    // Comprobamos que no exista otra categoría con el mismo nombre.
    .custom(async (value) => {
      // Buscamos en MongoDB una categoría que tenga ese nombre.
      const exists = await Category.findOne({ name: value });

      if (exists) {
        throw new Error("Ya existe una categoría con ese nombre");
      }

      return true;
    }),

  // Validamos la descripción de la categoría.
  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("La descripción no puede superar los 200 caracteres"),
];

export const updateCategoryValidation = [
  // Reutilizamos la validación del ID para comprobar que sea válido.
  ...categoryIdValidation,

  // Validamos el nombre solamente si se envía en la solicitud.
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .isLength({ min: 2, max: 30 })
    .withMessage("El nombre debe tener entre 2 y 30 caracteres")

    // Comprobamos que ninguna otra categoría tenga el mismo nombre.
    .custom(async (value, { req }) => {
      // Buscamos una categoría con ese nombre, excluyendo la que estamos editando.
      const exists = await Category.findOne({
        name: value,
        _id: { $ne: req.params.id },
      });

      if (exists) {
        throw new Error("Ya existe una categoría con ese nombre");
      }

      return true;
    }),

  // Validamos la descripción durante la actualización.
  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("La descripción no puede superar los 200 caracteres"),
];
