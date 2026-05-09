/**
 * Standard API response wrapper
 * All responses follow the structure: { data: T, success: boolean }
 */

/**
 * Send a success response
 * @param {import('express').Response} res
 * @param {*} data - Response payload
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    data,
    success: true,
  });
};

/**
 * Send an error response
 * @param {import('express').Response} res
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} [type] - Error type/code
 */
export const errorResponse = (res, message, statusCode = 500, type) => {
  return res.status(statusCode).json({
    data: {
      message,
      ...(type && { type }),
    },
    success: false,
  });
};
