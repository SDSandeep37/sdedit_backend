// import {
//   createCookie,
//   createTokenCookie,
//   destroyCookie,
//   destroyTokenCookie,
//   getCookie,
//   getTokenFromCookie,
// } from "../utils/cookies.js";

// export const setDefaultTokenCookie = async (request, response) => {
//   const token = request.body?.token || "demo-token";

//   createTokenCookie(response, token);

//   response.status(200).json({
//     success: true,
//     message: "Default token cookie created",
//   });
// };

// export const setCustomCookie = async (request, response) => {
//   const { name = "refreshToken", value = "demo-refresh-token" } = request.body || {};

//   createCookie(response, name, value, {
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   });

//   response.status(200).json({
//     success: true,
//     message: `${name} cookie created`,
//   });
// };

// export const readCookies = async (request, response) => {
//   response.status(200).json({
//     success: true,
//     token: getTokenFromCookie(request),
//     refreshToken: getCookie(request, "refreshToken"),
//   });
// };

// export const clearDefaultTokenCookie = async (request, response) => {
//   destroyTokenCookie(response);

//   response.status(200).json({
//     success: true,
//     message: "Default token cookie destroyed",
//   });
// };

// export const clearCustomCookie = async (request, response) => {
//   const { name = "refreshToken" } = request.body || {};

//   destroyCookie(response, name);

//   response.status(200).json({
//     success: true,
//     message: `${name} cookie destroyed`,
//   });
// };
