/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Indicates success or failure
 * @property {string} message - Response message
 * @property {any} [data] - Optional data payload
 * @property {Record<string, string[]>} [errors] - Optional array of error details
 */

/**
 * Sends a standardized API response.
 *
 * @template T
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Indicates success or failure
 * @param {string} message - Response message
 * @param {T} [data] - Optional response data
 * @param {Record<string, string[]>} [errors] - Optional array of error details
 */
function sendResponse(res, statusCode, success, message, data, errors) {
  /** @type {ApiResponse} */
  const response = {
    success,
    message,
    ...(data !== undefined && { data }),
    ...(errors !== undefined && { errors }),
  };

  res.status(statusCode).json(response);
}

const response = {
  /**
   * Sends a 200 OK response.
   * @template T
   * @param {import('express').Response} res
   * @param {string} message
   * @param {T} [data]
   */
  ok(res, message, data) {
    sendResponse(res, 200, true, message, data);
  },

  /**
   * Sends a 201 Created response.
   * @template T
   * @param {import('express').Response} res
   * @param {string} message
   * @param {T} [data]
   */
  created(res, message, data) {
    sendResponse(res, 201, true, message, data);
  },

  /**
   * Sends a 400 Bad Request response.
   * @param {import('express').Response} res
   * @param {string} message
   * @param {Record<string, string[]>} [errors]
   */
  badRequest(res, message, errors) {
    sendResponse(res, 400, false, message, undefined, errors);
  },

  /**
   * Sends a 401 Unauthorized response.
   * @param {import('express').Response} res
   * @param {string} message
   * @param {Record<string, string[]>} [errors]
   */
  unauthorized(res, message, errors) {
    sendResponse(res, 401, false, message, undefined, errors);
  },

  /**
   * Sends a 403 Forbidden response.
   * @param {import('express').Response} res
   * @param {string} message
   * @param {Record<string, string[]>} [errors]
   */
  forbidden(res, message, errors) {
    sendResponse(res, 403, false, message, undefined, errors);
  },

  /**
   * Sends a 404 Not Found response.
   * @param {import('express').Response} res
   * @param {string} message
   * @param {Record<string, string[]>} [errors]
   */
  notFound(res, message, errors) {
    sendResponse(res, 404, false, message, undefined, errors);
  },

  /**
   * Sends a 422 Unprocessable Entity response.
   * @param {import('express').Response} res
   * @param {string} message
   * @param {Record<string, string[]>} [errors]
   */
  validationError(res, message, errors) {
    sendResponse(res, 422, false, message, undefined, errors);
  },

  /**
   * Sends a 500 Internal Server Error response.
   * @param {import('express').Response} res
   * @param {string} message
   * @param {Record<string, string[]>} [errors]
   */
  serverError(res, message, errors) {
    sendResponse(res, 500, false, message, undefined, errors);
  },
  
  conflict(res, message, data) {
    sendResponse(res, 409, false, message, data);
  },
  
};

module.exports = { sendResponse, response };
