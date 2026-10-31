import { Router } from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validator } from "../middlewares/validator.middleware.js";
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
} from "../middlewares/validations/auth.validation.js";

const router = Router();

// registrar un usuario
router.post("/register", registerValidation, validator, register);
// iniciar sesión
router.post("/login", loginValidation, validator, login);
// obtener el perfil
router.get("/profile", authMiddleware, getProfile);
// actualizar el perfil
router.put(
  "/profile",
  authMiddleware,
  updateProfileValidation,
  validator,
  updateProfile,
);
// cerrar sesión
router.post("/logout", authMiddleware, logout);

export default router;
