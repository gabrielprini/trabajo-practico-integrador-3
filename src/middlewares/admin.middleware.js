// Primero: authMiddleware(req, res, next)
// crea: req.user Después: next(); hace que continúe:
// adminMiddleware(req, res, next) Y como es el mismo req, adminMiddleware puede hacer: req.user.role
// No porque next le pase user, sino porque los dos middleware están trabajando sobre el mismo objeto req.
export const adminMiddleware = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Acceso denegado. Se requiere rol de administrador.",
    });
  }

  next();
};
