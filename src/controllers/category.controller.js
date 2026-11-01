// Importamos matchedData para obtener los datos que pasaron las validaciones.
import { matchedData } from "express-validator";

// Importamos los modelos de Categoría y Evento para trabajar con MongoDB.
import Category from "../models/category.js";
import Event from "../models/event.js";

export const createCategory = async (req, res) => {
  try {
    // Obtenemos únicamente los datos que fueron validados.
    const data = matchedData(req);

    // Creamos una nueva categoría en MongoDB con esos datos.
    const category = await Category.create(data);

    return res.status(201).json({
      message: "Categoría creada correctamente",
      category, // Devolvemos la categoría creada.
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    // Buscamos todas las categorías guardadas en MongoDB.
    const categories = await Category.find();

    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    // Obtenemos el ID validado que viene en la solicitud.
    const { id } = matchedData(req);

    // Buscamos la categoría por su ID.
    // populate("events") agrega los eventos relacionados con esa categoría.
    const category = await Category.findById(id).populate("events");

    if (!category) {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    return res.status(200).json({ category });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    // Obtenemos el ID y los datos validados que se quieren modificar.
    // Con ...data separamos el resto de los campos del ID.
    const { id, ...data } = matchedData(req);

    // Buscamos la categoría antes de intentar actualizarla.
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    // Actualizamos la categoría con los datos recibidos.
    const updated = await Category.findByIdAndUpdate(id, data, {
      new: true, // Devuelve la categoría después de actualizarla.
      runValidators: true, // Ejecuta las validaciones del modelo.
    });

    return res.status(200).json({
      message: "Categoría actualizada correctamente",
      category: updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    // Obtenemos el ID validado de la categoría que queremos eliminar.
    const { id } = matchedData(req);

    // Buscamos la categoría para comprobar que exista.
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    // Antes de eliminarla, quitamos su ID de los eventos relacionados.
    // $pull elimina ese ID del array "categories" de cada evento.
    await Event.updateMany({ categories: id }, { $pull: { categories: id } });

    // Eliminamos la categoría de MongoDB.
    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Categoría eliminada correctamente y quitada de los eventos",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};
