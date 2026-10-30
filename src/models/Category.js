import mongoose from "mongoose";

// extrae Schema de mongoose para poder escribir new Schema() en lugar de new mongoose.Schema().
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [30, "El nombre no puede superar los 50 caracteres"],
    },

    description: {
      type: String,
      maxlength: [200, "El nombre no puede superar los 200 caracteres"],
    },
  },
  // aca modificamos el esquema
  {
    timestamps: true,
    versionKey: false,
    // Indica que, al convertir el documento a JSON, se incluyan también sus propiedades virtuales.
    toJSON: { virtuals: true },
    // Hace lo mismo al convertir el documento a un objeto JavaScript.
    toObject: { virtuals: true },
  },
);

categorySchema.virtual("events", {
  ref: "Event",
  localField: "_id",
  foreignField: "categories",
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
