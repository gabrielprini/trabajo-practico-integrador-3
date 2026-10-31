import { matchedData } from "express-validator";
import User from "../models/user.model.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";

// Configuramos las opciones de la cookie donde vamos a guardar el token.
const cookieOptions = {
  // Evita que JavaScript del navegador pueda acceder a la cookie.
  httpOnly: true,
  // Envía la cookie solamente por HTTPS en producción.
  secure: process.env.NODE_ENV === "production",
  // Evita que la cookie se envíe desde otros sitios.
  sameSite: "strict",
  // Establece la duración de la cookie en 1 hora.
  maxAge: 60 * 60 * 1000,
};

export const register = async (req, res) => {
  try {
    // Obtenemos los datos que pasaron las validaciones.
    const { username, email, password, profile } = matchedData(req);

    // Encriptamos la contraseña antes de guardarla en MongoDB.
    const hashedPassword = await hashPassword(password);

    // Creamos un nuevo usuario en la base de datos.
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      profile,
    });

    // Convertimos el documento de Mongoose en un objeto JavaScript.
    const userData = user.toObject();

    // Eliminamos la contraseña para evitar enviarla en la respuesta.
    delete userData.password;

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const login = async (req, res) => {
  try {
    // Obtenemos el email y la contraseña que pasaron las validaciones.
    const { email, password } = matchedData(req);

    // Buscamos un usuario por su email que no haya sido eliminado.
    const user = await User.findOne({ email, deletedAt: null });

    // Si no encontramos el usuario error 401.
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Comparamos la contraseña ingresada con la contraseña encriptada guardada en MongoDB.
    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generamos un token JWT con el ID y el rol del usuario.
    const token = generateToken({ id: user._id, role: user.role });

    // Guardamos el token en una cookie del navegador.
    res.cookie("token", token, cookieOptions);

    // Devolvemos los datos del usuario sin incluir su contraseña.
    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getProfile = async (req, res) => {
  try {
    // Buscamos al usuario utilizando el ID guardado en req.user por el middleware de autenticación.
    // .select("-password") excluye la contraseña de la consulta a MongoDB.
    const user = await User.findById(req.user.id).select("-password");

    // Devolvemos los datos del usuario sin incluir su contraseña.
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // Obtenemos los datos del perfil que pasaron las validaciones.
    const { profile } = matchedData(req);

    // Creamos un objeto vacío para guardar solamente los campos que se van a modificar.
    const updates = {};

    // Convierte el objeto profile en un array de pares: cada par contiene una clave y su valor.
    for (const [key, value] of Object.entries(profile)) {
      // pdates[\profile.$`] = value`, agrega cada campo al objeto updates. updates: es el objeto donde guardamos los cambios.
      // inserta el valor de la variable key y value asigna el valor correspondiente.
      updates[`profile.${key}`] = value;
    }

    // Buscamos al usuario por su ID y actualizamos los campos recibidos.
    const user = await User.findByIdAndUpdate(
      req.user.id,
      // $set modifica solamente los campos indicados.
      { $set: updates },
      // Devuelve el usuario actualizado y ejecuta las validaciones del modelo.
      { new: true, runValidators: true },
      // Excluimos la contraseña del resultado.
    ).select("-password");

    // el perfil se actualizó correctamente.
    return res.status(200).json({
      message: "Perfil actualizado correctamente",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// cerrar sesion
export const logout = async (req, res) => {
  try {
    // Eliminamos la cookie que contiene el token JWT para cerrar la sesión.
    res.clearCookie("token", { ...cookieOptions, maxAge: undefined });

    return res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
