const DEFAULT_COOKIE_NAME = "token";
const DEFAULT_MAX_AGE = 60 * 60 * 1000;

const isProduction = process.env.NODE_ENV === "production";

function getBaseCookieOptions(overrides = {}) {
  const sameSite = overrides.sameSite ?? (isProduction ? "none" : "lax");
  const secure = overrides.secure ?? (isProduction || sameSite === "none");

  const options = {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    ...overrides,
  };

  if (!options.domain && process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  return options;
}

function assertResponse(response) {
  if (!response || typeof response.cookie !== "function") {
    throw new TypeError("A valid Express response object is required.");
  }
}

function assertCookieName(name) {
  if (!name || typeof name !== "string") {
    throw new TypeError("Cookie name must be a non-empty string.");
  }
}

/**
 * Create a secure, HTTP-only cookie.
 *
 * @param {import("express").Response} response Express response object.
 * @param {string} nameOrValue Cookie value, or cookie name when value is provided.
 * @param {string|object} valueOrOptions Cookie value, or options when using default cookie name.
 * @param {object} options Optional Express cookie options.
 * @returns {import("express").Response}
 */
export function createCookie(
  response,
  nameOrValue,
  valueOrOptions,
  options = {}
) {
  assertResponse(response);

  const hasExplicitName = valueOrOptions !== undefined && typeof valueOrOptions !== "object";
  const name = hasExplicitName ? nameOrValue : DEFAULT_COOKIE_NAME;
  const value = hasExplicitName ? valueOrOptions : nameOrValue;
  const cookieOverrides = hasExplicitName ? options : valueOrOptions ?? {};

  assertCookieName(name);

  if (value === undefined || value === null) {
    throw new TypeError("Cookie value is required.");
  }

  const cookieOptions = getBaseCookieOptions({
    maxAge: DEFAULT_MAX_AGE,
    ...cookieOverrides,
  });

  return response.cookie(name, value, cookieOptions);
}

/**
 * Destroy an HTTP-only cookie using the same attributes used to create it.
 *
 * @param {import("express").Response} response Express response object.
 * @param {string} name Cookie name.
 * @param {object} options Optional Express cookie options.
 * @returns {import("express").Response}
 */
export function destroyCookie(response, name = DEFAULT_COOKIE_NAME, options = {}) {
  assertResponse(response);
  assertCookieName(name);

  const { maxAge, expires, ...clearOptions } = getBaseCookieOptions(options);

  return response.clearCookie(name, clearOptions);
}

export function createTokenCookie(response, token, maxAge = DEFAULT_MAX_AGE) {
  return createCookie(response, token, { maxAge });
}

export function destroyTokenCookie(response) {
  return destroyCookie(response, DEFAULT_COOKIE_NAME);
}

export function getCookie(request, name = DEFAULT_COOKIE_NAME) {
  assertCookieName(name);
  return request?.cookies?.[name] ?? null;
}

export function getTokenFromCookie(request) {
  return getCookie(request, DEFAULT_COOKIE_NAME);
}
