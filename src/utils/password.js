import bcrypt from "bcrypt";

// Password hashing
export async function hashPassword(password) {
  const saltRounds = 10; // cost factor
  const hashed = await bcrypt.hash(password, saltRounds);
  return hashed;
}

// Password comparison (for login)
export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}
