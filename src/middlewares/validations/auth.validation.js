import { body } from "express-validator";
// importamos el modelo de usuario para consultar la base de datos MongoDB.
import User from "../../models/user.model.js";

// Creamos una expresión regular para comprobar que un nombre tenga solamente letras y espacios.
const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

// Recibe un parámetro llamado required:
// Si required es true, los campos deben cumplir las validaciones obligatorias.
// Si required es false, los campos pueden omitirse durante una actualización.
export const profileRules = (required) => {
  // La función interna optionalIfUpdate sirve para reutilizar las mismas reglas sin tener que escribirlas dos veces.
  const optionalIfUpdate = (chain) => (required ? chain : chain.optional());

  return [
    optionalIfUpdate(body("profile.firstName"))
      // elimina los espacios al principio y al final.
      .trim()
      .notEmpty()
      .withMessage("El nombre es obligatorio")
      .isLength({ min: 2, max: 50 })
      .withMessage("El nombre debe tener entre 2 y 50 caracteres")
      .matches(onlyLetters)
      .withMessage("El nombre solo puede tener letras"),

    optionalIfUpdate(body("profile.lastName"))
      .trim()
      .notEmpty()
      .withMessage("El apellido es obligatorio")
      .isLength({ min: 2, max: 50 })
      .withMessage("El apellido debe tener entre 2 y 50 caracteres")
      .matches(onlyLetters)
      .withMessage("El apellido solo puede tener letras"),

    body("profile.birthDate")
      .optional()
      // comprueba que tenga un formato de fecha válido, por ejemplo 2005-08-15.
      .isISO8601()
      .withMessage("La fecha de nacimiento no es válida")
      .custom((value) => {
        if (new Date(value) > new Date()) {
          throw new Error("La fecha de nacimiento no puede ser futura");
        }
        return true;
      }),

    body("profile.phone")
      .optional()
      .matches(/^\d{8,15}$/)
      .withMessage("El teléfono debe tener solo números, entre 8 y 15 dígitos"),
  ];
};

// array de validaciones para cuando alguien se registra.
export const registerValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("El username es obligatorio")
    .isLength({ min: 3, max: 20 })
    .withMessage("El username debe tener entre 3 y 20 caracteres")
    .isAlphanumeric()
    .withMessage("El username solo puede tener letras y números")
    .custom(async (value) => {
      const exists = await User.findOne({ username: value });
      if (exists) throw new Error("El username ya está en uso");
      return true;
    }),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("El email no tiene un formato válido")
    .normalizeEmail()
    .custom(async (value) => {
      const exists = await User.findOne({ email: value });
      if (exists) throw new Error("El email ya está registrado");
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/[a-z]/)
    .withMessage("La contraseña debe tener al menos una minúscula")
    .matches(/[A-Z]/)
    .withMessage("La contraseña debe tener al menos una mayúscula")
    .matches(/\d/)
    .withMessage("La contraseña debe tener al menos un número"),

  body("profile").isObject().withMessage("El perfil es obligatorio"),
  ...profileRules(true),
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("El email no tiene un formato válido")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];

export const updateProfileValidation = [
  body("profile").isObject().withMessage("El perfil es obligatorio"),
  ...profileRules(false),
];
