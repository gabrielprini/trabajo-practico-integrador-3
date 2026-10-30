import mongoose from "mongoose";

// extrae Schema de mongoose para poder escribir new Schema() en lugar de new mongoose.Schema().
const { Schema } = mongoose;

// Un schema es una estructura que define qué campos puede tener un documento y qué reglas deben cumplir.
const profileSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [50, "El nombre no puede superar los 50 caracteres"],
    },
    lastName: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      minlength: [2, "El apellido debe tener al menos 2 caracteres"],
      maxlength: [50, "El apellido no puede superar los 50 caracteres"],
    },
    birthDate: {
      type: Date,
    },
    phone: {
      type: String,
    },
  },
  // le indicamos que no genere un _id propio para el perfil embebido.
  { _id: false },
);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "El username es obligatorio"],
      unique: true,
      minlength: [3, "El username debe tener al menos 3 caracteres"],
      maxlength: [20, "El username no puede superar los 20 caracteres"],
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "El email no tiene un formato válido"],
    },
    password: {
      type: String, // acá se guarda el hash, no la contraseña original
      required: [true, "La contraseña es obligatoria"],
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "El rol debe ser 'user' o 'admin'",
      },
      default: "user",
    },
    // conecta el esquema del perfil con el esquema del usuario. 
    // profileSchema: indica que profile contiene los campos definidos anteriormente en profileSchema.
    profile: {
      type: profileSchema,
      required: [true, "El perfil es obligatorio"],
    },
    // eliminación lógica
    deletedAt: {
      type: Date,
      default: null,
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

// Virtual populate: eventos organizados por el usuario
userSchema.virtual("events", {
  // indica que los documentos relacionados pertenecen al modelo Event
  ref: "Event",
  // utiliza el identificador del usuario para buscar coincidencias
  localField: "_id",
  // busca en los eventos el campo organizer que coincida con ese identificador.
  foreignField: "organizer",
});
// Crea el modelo User a partir del esquema userSchema.
const User = mongoose.model("User", userSchema);

export default User;
