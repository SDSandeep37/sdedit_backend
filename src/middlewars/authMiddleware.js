import jwt from "jsonwebtoken";
import { getTokenFromCookie } from "../utils/cookies.js";

export function verifyToken(request, response, next) {
  let token = null;

  // Check for token in cookies first
  token = getTokenFromCookie(request);
  // console.log(token);

  // Fallback to Authorization header if no cookie found
  if (!token) {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  // Check if token exists
  if (!token) {
    return response.status(401).json({
      success: false,
      message: "Authorization required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    // Attach user data
    request.user = decoded;
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token expired, please log in again"
        : "Invalid token";
    return response.status(401).json({
      message: message,
      success: false,
    });
  }
}
