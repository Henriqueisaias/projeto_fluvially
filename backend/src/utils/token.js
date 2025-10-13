import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "fallback-secret";

export function createUserToken(user) {
  return jwt.sign(
    { name: user.name, id: user._id },
    SECRET,
    { expiresIn: "1h" } // 1 hora de validade
  );
}

export function verifyUserToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
