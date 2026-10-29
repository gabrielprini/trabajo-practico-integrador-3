// mongoose es una librería que permite trabajar con MongoDB desde Node.js.
import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        // aca intentamos intentando conectarnos con mongo que obtenemos la direccion desde la 
        // variable de entorno 
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("conectado a MongoDB");
    } catch (error) {
        console.error("Error al conectar a MongoDB:", error.message);
        process.exit(1);
    }
};
