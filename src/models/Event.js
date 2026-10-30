import mongoose from "mongoose";

const { Schema } = mongoose;

const locationSchema = new Schema(
  {
    venue: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      minlength: [3, "El nombre debe tener al menos 3 caracteres"],
      maxlength: [100, "El nombre no puede superar los 100 caracteres"],
    },
    address: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      minlength: [5, "El apellido debe tener al menos 5 caracteres"],
      maxlength: [150, "El apellido no puede superar los 150 caracteres"],
    },
    city: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      minlength: [2, "El apellido debe tener al menos 2 caracteres"],
      maxlength: [50, "El apellido no puede superar los 50 caracteres"],
    },
  },
  { _id: false },
);

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "El username es obligatorio"],
      unique: true,
      minlength: [3, "El username debe tener al menos 3 caracteres"],
      maxlength: [150, "El username no puede superar los 150 caracteres"],
    },

    description: {
      type: String,
      required: [true, "El descripcion es obligatoria"],
      minlength: [20, "El username debe tener al menos 20 caracteres"],
    },

    startDate: {
      type: Date,
      required: [true, "La fecha es obligatoria"],
    },

    endDate: {
      type: Date,
      required: [true, "La fecha es obligatoria"],
    },

    capacity: {
      type: Number,
      min: [1, "La capacidad mínima es 1"],
      validate: {
        validator: Number.isInteger,
        message: "La capacidad debe ser un número entero",
      },
    },

    price: {
      type: Number,
      min: [0, "El precio no puede ser negativo"],
      default: 0,
    },

    status: {
      type: String,
      enum: {
        values: ["scheduled", "cancelled", "finished"],
        message: "El estado debe ser 'scheduled', 'cancelled' o 'finished'",
      },
      default: "scheduled",
    },

    // Le estás diciendo a Mongoose que el campo location debe
    // seguir la estructura definida en locationSchema
    location: {
      type: locationSchema,
      required: [true, "La ubicación es obligatoria"],
    },

    // Este campo indica qué usuario organiza el evento.
    organizer: {
      // el campo almacena un identificador de MongoDB
      type: Schema.Types.ObjectId,
      // indica que ese identificador corresponde a un documento del modelo User
      ref: "User",
      // exige que el evento tenga un organizador.
      required: [true, "El organizador es obligatorio"],
    },

    // es un array
    categories: [
      {
        type: Schema.Types.ObjectId,
        // hace referencia a un documento del modelo Category
        ref: "Category",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
