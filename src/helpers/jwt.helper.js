// Traemos la librería jsonwebtoken, que nos permite crear y verificar tokens JWT.
import jwt from "jsonwebtoken";

// El token sirve para que después el servidor pueda reconocer que el usuario está autenticado.

// Esta función sirve para crear un token JWT
// El payload son los datos que queremos guardar dentro del token.
export const generateToken = (payload) => {
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Esta función hace lo contrario.
// generateToken(): Crea el token.
// verifyToken(): Comprueba si el token es válido.
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
