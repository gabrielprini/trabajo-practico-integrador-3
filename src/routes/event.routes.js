import { Router } from "express";
import {
  createEvent,
  getEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { ownerOrAdminMiddleware } from "../middlewares/ownerOrAdmin.middleware.js";
import { validator } from "../middlewares/validator.middleware.js";
import {
  eventIdValidation,
  createEventValidation,
  updateEventValidation,
} from "../middlewares/validations/event.validation.js";

const router = Router();

router.post("/", authMiddleware, createEventValidation, validator, createEvent);
router.get("/", authMiddleware, getEvents);

// indica que queremos consultar nuestros propios eventos.
router.get("/my", authMiddleware, getMyEvents);

router.get("/:id", authMiddleware, eventIdValidation, validator, getEventById);

router.put(
  "/:id",
  authMiddleware,
  eventIdValidation,
  validator,
  ownerOrAdminMiddleware,
  updateEventValidation,
  validator,
  updateEvent,
);

router.delete(
  "/:id",
  authMiddleware,
  eventIdValidation,
  validator,
  ownerOrAdminMiddleware,
  deleteEvent,
);

export default router;
