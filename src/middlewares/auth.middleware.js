import { verifyToken } from "../helpers/jwt.helper.js";
// Lo necesitamos porque después vamos a buscar en la base de datos el usuario que corresponde al token.
import { User } from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Acá buscamos el JWT dentro de las cookies, el ?. significa: Si req.cookies existe, buscá token; si no existe, no tires un error.
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message:
          "No autenticado. Debe iniciar sesión para acceder a este recurso.",
      });
    }

    // Si el token es válido, decoded contiene los datos que habíamos puesto en el payload.
    const decoded = verifyToken(token);

    // Buscamos al usuario del token, ignorando a los eliminados lógicamente
    const foundUser = await User.findOne({ _id: decoded.id, deletedAt: null });
    if (!foundUser) {
      return res.status(401).json({
        message: "El usuario asociado al token ya no existe.",
      });
    }

    // Estamos agregando información a la petición:
    req.user = {
      id: foundUser._id,
      username: foundUser.username,
      email: foundUser.email,
      role: foundUser.role,
    };

    // Todo está bien, dejá pasar la petición al siguiente paso.
    next();
  } catch (error) {
    return res.status(401).json({
      message: "token invalido o expirado",
    });
  }
};
