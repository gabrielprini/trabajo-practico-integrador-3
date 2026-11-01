import { matchedData } from "express-validator";
import User from "../models/user.js";
import Event from "../models/event.js";
import { hashPassword } from "../helpers/bcrypt.helper.js";

export const getUsers = async (req, res) => {
  try {
    // Buscamos todos los usuarios que no fueron eliminados.
    // deletedAt: null significa que el usuario sigue activo.
    const users = await User.find({ deletedAt: null })

      // Excluimos la contraseña de los resultados.
      .select("-password")

      // Obtenemos los eventos relacionados con cada usuario.
      .populate("events");

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = matchedData(req);

    const user = await User.findOne({
      _id: id,
      deletedAt: null,
    })

      .select("-password")

      .populate("events");

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    // Obtenemos el ID, el perfil, la contraseña
    // Con ...data agrupamos los campos restantes.
    const { id, profile, password, ...data } = matchedData(req);

    // Buscamos al usuario para comprobar que exista y no esté eliminado.
    const exists = await User.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!exists) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Creamos un objeto con los datos que queremos actualizar.
    const updates = { ...data };

    // Comprobamos si se envió una nueva contraseña.
    if (password) {
      // Encriptamos la contraseña antes de guardarla en MongoDB.
      updates.password = await hashPassword(password);
    }

    // Comprobamos si se enviaron datos del perfil.
    if (profile) {
      // Recorremos cada propiedad del perfil.
      // Object.entries convierte el objeto en pares clave-valor.
      for (const [key, value] of Object.entries(profile)) {
        // Agregamos cada campo individualmente a las actualizaciones.
        // Ejemplo: "profile.firstName": "Gabriel".
        updates[`profile.${key}`] = value;
      }
    }

    // Buscamos al usuario por su ID y actualizamos sus datos.
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates }, // Modificamos solamente los campos indicados.
      {
        new: true, // Devuelve el usuario después de actualizarlo.
        runValidators: true, // Ejecuta las validaciones del modelo.
      },
    )

      .select("-password");

    return res.status(200).json({
      message: "Usuario actualizado correctamente",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    // Obtenemos el ID del usuario que pasó las validaciones.
    const { id } = matchedData(req);

    // Buscamos al usuario por su ID y comprobamos que siga activo.
    const user = await User.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // ELIMINACIÓN LÓGICA
    // En lugar de borrar el usuario de MongoDB,
    // guardamos la fecha y hora en la que fue eliminado.
    user.deletedAt = new Date();

    // Guardamos los cambios en MongoDB.
    await user.save();

    // Buscamos y eliminamos todos los eventos organizados por ese usuario.
    const { deletedCount } = await Event.deleteMany({
      organizer: id,
    });

    return res.status(200).json({
      message: "Usuario eliminado correctamente",
      eventsDeleted: deletedCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};
