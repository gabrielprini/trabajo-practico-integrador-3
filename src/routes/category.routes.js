import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { validator } from "../middlewares/validator.middleware.js";
import {
  categoryIdValidation,
  createCategoryValidation,
  updateCategoryValidation,
} from "../middlewares/validations/category.validation.js";

const router = Router();

// crear una catergoria
// POST: permite crear una categoría nueva.
// authMiddleware: verifica que el usuario haya iniciado sesión.
// adminMiddleware: verifica que el usuario sea administrador.
// createCategoryValidation: valida los datos de la categoría.
// validator: comprueba si hubo errores en las validaciones.
// createCategory: ejecuta la función que guarda la categoría en MongoDB.
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createCategoryValidation,
  validator,
  createCategory
);

// obtenemos todas las categorias
// GET: permite consultar todas las categorías.
// authMiddleware: exige que el usuario haya iniciado sesión.
// getCategories: busca y devuelve todas las categorías.
router.get(
  "/",
  authMiddleware,
  getCategories
);

// obtenemos su id 
// GET /:id: permite consultar una categoría específica.
// categoryIdValidation: comprueba que el ID tenga un formato válido de MongoDB.
// getCategoryById: busca la categoría por su ID y devuelve sus datos.
router.get(
  "/:id",
  authMiddleware,
  categoryIdValidation,
  validator,
  getCategoryById
);

// actualizamos una categoria
// PUT /:id: permite modificar una categoría existente.
// updateCategoryValidation: valida el ID y los datos que se quieren modificar.
// updateCategory: actualiza la categoría en MongoDB.
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateCategoryValidation,
  validator,
  updateCategory
);

// eliminamos una categoria 
// DELETE /:id: permite eliminar una categoría existente.
// deleteCategory: elimina la categoría y la quita de los eventos relacionados.
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  categoryIdValidation,
  validator,
  deleteCategory
);
export default router;
