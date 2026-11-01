import { matchedData } from "express-validator";
import Event from "../models/event.js";

const populateOptions = [
  {
    path: "organizer",

    // Seleccionamos solamente estos campos del usuario.
    select: "username email profile",
  },
  {
    // Obtenemos las categorías relacionadas con el evento.
    path: "categories",
  },
];

export const createEvent = async (req, res) => {
  try {
    // Obtenemos los datos del evento que pasaron las validaciones.
    const data = matchedData(req);

    // Creamos un nuevo evento en MongoDB.
    const event = await Event.create({
      // Copiamos todos los datos recibidos y validados.
      ...data,

      // Asignamos como organizador al usuario que inició sesión.
      // req.user.id contiene su ID gracias al authMiddleware.
      organizer: req.user.id,
    });

    // Completamos los datos del organizador y las categorías.
    // Así devolvemos sus datos en lugar de mostrar solamente sus IDs.
    await event.populate(populateOptions);

    return res.status(201).json({
      message: "Evento creado correctamente",
      event,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const getEvents = async (req, res) => {
  try {
    // Buscamos todos los eventos guardados en MongoDB.
    // populateOptions agrega los datos del organizador y las categorías.
    const events = await Event.find().populate(populateOptions);

    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

// FUNCIÓN PARA OBTENER LOS EVENTOS DEL USUARIO AUTENTICADO
export const getMyEvents = async (req, res) => {
  try {
    // Buscamos solamente los eventos cuyo organizador sea el usuario
    // que inició sesión.
    const events = await Event.find({
      organizer: req.user.id,
    }).populate(populateOptions);

    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    // Obtenemos el ID del evento que pasó las validaciones.
    const { id } = matchedData(req);

    // Buscamos el evento por su ID.
    // También obtenemos los datos del organizador y las categorías.
    const event = await Event.findById(id).populate(populateOptions);

    if (!event) {
      return res.status(404).json({
        message: "Evento no encontrado",
      });
    }

    return res.status(200).json({ event });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    // Obtenemos el ID, la ubicación y el resto de los datos validados.
    // Con ...data separamos los demás campos del ID y de location.
    const { id, location, ...data } = matchedData(req);

    // Creamos un objeto con los datos que queremos actualizar.
    const updates = { ...data };

    // Comprobamos si se envió una nueva ubicación.
    if (location) {
      // Recorremos cada propiedad de la ubicación.
      // Object.entries convierte el objeto en pares clave-valor.
      for (const [key, value] of Object.entries(location)) {
        // Creamos actualizaciones individuales usando la notación de punto.
        // Ejemplo: "location.city": "Formosa".
        updates[`location.${key}`] = value;
      }
    }

    // Buscamos el evento por su ID y actualizamos sus datos.
    const event = await Event.findByIdAndUpdate(
      id,
      { $set: updates }, // $set modifica solamente los campos enviados.
      {
        new: true, // Devuelve el evento después de actualizarlo.
        runValidators: true, // Ejecuta las validaciones del modelo.
      },
    ).populate(populateOptions); // Agrega los datos del organizador y categorías.

    if (!event) {
      return res.status(404).json({
        message: "Evento no encontrado",
      });
    }

    return res.status(200).json({
      message: "Evento actualizado correctamente",
      event,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    // Obtenemos el ID del evento que pasó las validaciones.
    const { id } = matchedData(req);

    // Buscamos el evento por su ID y lo eliminamos de MongoDB.
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        message: "Evento no encontrado",
      });
    }

    return res.status(200).json({
      message: "Evento eliminado correctamente",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};
