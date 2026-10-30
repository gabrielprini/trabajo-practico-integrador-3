// importamos la libreria bcrypt que nos permite:
//convertir una contraseña en un hash y comparar una contraseña con un hash
// Un hash es una transformación de un dato (por ejemplo, una contraseña) en una cadena de caracteres que no se puede volver fácilmente a la contraseña original.
// por ejemplo: Contraseña: "123456", bcrypt Hash: "$2b$10$X7f8K...."
import bcrypt from 'bcrypt';

// Indica cuántas veces bcrypt procesa la contraseña para generar el hash. Es como decir que tan dificil hacemos el hash
const SALT_ROUNDS = 10;


// plainPassword es la contraseña sin proteger, despues bcrypt.hash la transforma en un hash
// usamos el async porque bcrypt.hash() es una operación que puede tardar un poco y devuelve una promesa
export const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

// Esta función se usa cuando el usuario inicia sesión. Comprueba si la contraseña que escribió el usuario corresponde con el hash guardado.
// compare() hace una comprobación matemática para saber si coinciden.
export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};