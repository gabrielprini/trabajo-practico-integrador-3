import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { validator } from "../middlewares/validator.middleware.js";
import {
  userIdValidation,
  updateUserValidation,
} from "../middlewares/validations/user.validation.js";

const router = Router();

// Todas las rutas de users son solo para admin
router.use(authMiddleware, adminMiddleware);

router.get("/", getUsers);
router.get("/:id", userIdValidation, validator, getUserById);
router.put("/:id", updateUserValidation, validator, updateUser);
router.delete("/:id", userIdValidation, validator, deleteUser);

export default router;
