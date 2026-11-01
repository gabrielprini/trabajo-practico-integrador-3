import Event from "../models/event.model.js";

export const ownerOrAdminMiddleware = async (req, res, next) => {
  try {
    // Buscamos en MongoDB el evento utilizando el ID que llega por los parámetros de la URL.
    const event = await Event.findById(req.params.id);

    // Si no encontramos el evento, devolvemos un error 404.
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    // Convertimos los ObjectId a String para poder compararlos correctamente.
    // Comparamos si el ID del organizador del evento es igual al ID del usuario que está logueado.
    const isOwner = event.organizer.toString() === req.user.id.toString();

    // Comprobamos si el usuario que inició sesión tiene el rol de administrador.
    const isAdmin = req.user.role === "admin";

    // Si el usuario no es el organizador ni es administrador, le denegamos el acceso.
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Acceso denegado. Solo el autor o un administrador pueden realizar esta acción.",
      });
    }

    // Guardamos el evento encontrado en req.event para que el controlador
    // pueda utilizarlo sin tener que volver a buscarlo en MongoDB.
    req.event = event;

    // Permitimos que la solicitud continúe hacia el siguiente middleware o controlador.
    next();

  } catch (error) {
    // Capturamos cualquier error que ocurra durante la búsqueda o verificación.
    return res.status(500).json({
      message: "Error al verificar la propiedad del recurso.",
    });
  }
};