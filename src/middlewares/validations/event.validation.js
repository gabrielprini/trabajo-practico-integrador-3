import { body, param } from "express-validator";
import Event from "../../models/event.js";
import Category from "../../models/category.js";

export const eventIdValidation = [
  // Comprobamos que el ID recibido en la URL tenga un formato válido de MongoDB.
  param("id").isMongoId().withMessage("El ID del evento no es válido"),
];

// Esta función se reutiliza al crear o actualizar un evento.
const categoriesExist = async (value) => {
  // Set elimina los IDs duplicados para no contarlos más de una vez.
  // Con ... convertimos el Set nuevamente en un array.
  const ids = [...new Set(value)];

  // Buscamos cuántas de las categorías enviadas existen en MongoDB.
  // $in busca documentos cuyo _id esté dentro del array ids.
  const count = await Category.countDocuments({
    _id: { $in: ids },
  });

  // Si la cantidad encontrada es diferente a la cantidad de IDs únicos,
  // significa que al menos una categoría no existe.
  if (count !== ids.length) {
    throw new Error("Una o más categorías no existen");
  }

  // Si todas las categorías existen, la validación es correcta.
  return true;
};

export const createEventValidation = [
  // validamos el titulo
  body("title")
    .trim()
    .notEmpty()
    .withMessage("El título es obligatorio")
    .isLength({ min: 3, max: 150 })
    .withMessage("El título debe tener entre 3 y 150 caracteres")

    // Comprueba que no exista otro evento con el mismo título.
    .custom(async (value) => {
      const exists = await Event.findOne({ title: value });

      if (exists) {
        throw new Error("Ya existe un evento con ese título");
      }

      return true;
    }),

  // validamos la descripcion
  body("description")
    .trim()
    .notEmpty()
    .withMessage("La descripción es obligatoria")
    .isLength({ min: 20 })
    .withMessage("La descripción debe tener al menos 20 caracteres"),

  body("startDate")
    .notEmpty()
    .withMessage("La fecha de inicio es obligatoria")
    .isISO8601()
    .withMessage("La fecha de inicio no es válida"),

  body("endDate")
    .notEmpty()
    .withMessage("La fecha de fin es obligatoria")
    .isISO8601()
    .withMessage("La fecha de fin no es válida")

    // Comprobamos que la fecha de fin sea posterior a la de inicio.
    .custom((value, { req }) => {
      // Convertimos ambas fechas a objetos Date para poder compararlas.
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error(
          "La fecha de fin debe ser posterior a la fecha de inicio",
        );
      }
      return true;
    }),

  body("capacity")
    .notEmpty()
    .withMessage("La capacidad es obligatoria")
    .isInt({ min: 1 })
    .withMessage("La capacidad debe ser un entero mayor o igual a 1"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El precio debe ser un número mayor o igual a 0"),

  body("status")
    .optional()
    .isIn(["scheduled", "cancelled", "finished"])
    .withMessage("El estado debe ser 'scheduled', 'cancelled' o 'finished'"),

  body("location")
    .isObject() // Comprueba que location sea un objeto.
    .withMessage("La ubicación es obligatoria"),

  body("location.venue")
    .trim()
    .notEmpty()
    .withMessage("El lugar es obligatorio")
    .isLength({ min: 3, max: 100 })
    .withMessage("El lugar debe tener entre 3 y 100 caracteres"),

  body("location.address")
    .trim()
    .notEmpty()
    .withMessage("La dirección es obligatoria")
    .isLength({ min: 5, max: 150 })
    .withMessage("La dirección debe tener entre 5 y 150 caracteres"),

  body("location.city")
    .trim()
    .notEmpty()
    .withMessage("La ciudad es obligatoria")
    .isLength({ min: 2, max: 50 })
    .withMessage("La ciudad debe tener entre 2 y 50 caracteres"),

  body("categories")
    .optional()
    .isArray()
    .withMessage("Las categorías deben enviarse en un array"),

  body("categories.*")
    // El * significa que se valida cada elemento del array.
    .isMongoId()
    .withMessage("Cada categoría debe ser un ID válido"),

  body("categories").optional().custom(categoriesExist),

  // La función categoriesExist comprueba que todos los IDs
  // enviados correspondan a categorías que existen en MongoDB.
];

// validaciones para actualizar un evento
export const updateEventValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El título no puede estar vacío")
    .isLength({ min: 3, max: 150 })
    .withMessage("El título debe tener entre 3 y 150 caracteres")

    // Comprueba que no exista otro evento con el mismo título.
    .custom(async (value, { req }) => {
      const exists = await Event.findOne({
        title: value,

        // $ne significa "distinto de".
        // Excluimos el evento que estamos editando de la búsqueda.
        _id: { $ne: req.params.id },
      });

      if (exists) {
        throw new Error("Ya existe un evento con ese título");
      }

      return true;
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 20 })
    .withMessage("La descripción debe tener al menos 20 caracteres"),

  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("La fecha de inicio no es válida"),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("La fecha de fin no es válida")
    .custom(async (value, { req }) => {
      // Primero usamos la fecha de inicio enviada en la petición.
      let start = req.body.startDate;

      // Si no se envió startDate, buscamos el evento en MongoDB
      // para obtener la fecha de inicio que ya tenía guardada.
      if (!start) {
        const event = await Event.findById(req.params.id);
        start = event?.startDate;
      }

      // Si tenemos una fecha de inicio, comprobamos que la fecha de fin
      // sea posterior.
      if (start && new Date(value) <= new Date(start)) {
        throw new Error(
          "La fecha de fin debe ser posterior a la fecha de inicio",
        );
      }

      return true;
    }),

  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La capacidad debe ser un entero mayor o igual a 1"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El precio debe ser un número mayor o igual a 0"),

  body("status")
    .optional()
    .isIn(["scheduled", "cancelled", "finished"])
    .withMessage("El estado debe ser 'scheduled', 'cancelled' o 'finished'"),

  body("location.venue")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("El lugar debe tener entre 3 y 100 caracteres"),

  body("location.address")
    .optional()
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage("La dirección debe tener entre 5 y 150 caracteres"),

  body("location.city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("La ciudad debe tener entre 2 y 50 caracteres"),

  body("categories")
    .optional()
    .isArray()
    .withMessage("Las categorías deben enviarse en un array"),

  body("categories.*")
    .isMongoId()
    .withMessage("Cada categoría debe ser un ID válido"),

  // comprobamos que todas las categorias existan
  body("categories").optional().custom(categoriesExist),
];
