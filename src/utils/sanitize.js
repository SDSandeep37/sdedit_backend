import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import validator from "validator";

// Create virtual DOM for DOMPurify
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

/**
 * Sanitize HTML input
 * Useful for comments, rich text, descriptions, etc.
 *
 * @param {string} input
 * @param {object} options
 * @returns {string}
 */
export function sanitizeHTML(input = "", options = {}) {
  return DOMPurify.sanitize(String(input), {
    USE_PROFILES: { html: true },
    ...options,
  });
}

/**
 * Sanitize plain text
 * Trim + escape dangerous characters
 *
 * @param {string} input
 * @returns {string}
 */
export function sanitizeText(input = "") {
  return validator.escape(validator.trim(String(input)));
}

/**
 * Sanitize and validate email
 *
 * @param {string} email
 * @returns {string|null}
 */
export function sanitizeEmail(email = "") {
  const normalized = validator.normalizeEmail(String(email));

  if (normalized && validator.isEmail(normalized)) {
    return normalized;
  }

  return null;
}

/**
 * Sanitize integer numbers
 *
 * @param {string|number} input
 * @returns {number|null}
 */
export function sanitizeNumber(input) {
  const str = String(input).trim();

  if (validator.isInt(str)) {
    return Number.parseInt(str, 10);
  }

  return null;
}

/**
 * Sanitize floating point numbers
 *
 * @param {string|number} input
 * @returns {number|null}
 */
export function sanitizeFloat(input) {
  const str = String(input).trim();

  if (validator.isFloat(str)) {
    return Number.parseFloat(str);
  }

  return null;
}

/**
 * Sanitize boolean values
 *
 * @param {any} input
 * @returns {boolean|null}
 */
export function sanitizeBoolean(input) {
  if (typeof input === "boolean") return input;

  const str = String(input).toLowerCase().trim();

  if (str === "true" || str === "1") return true;
  if (str === "false" || str === "0") return false;

  return null;
}
