import { Request, Response, NextFunction } from 'express';
import { IsApiError, ApiError } from '../utils/ApiError';
import { errorResponse } from '../utils/ApiResponse';
const currentEnv = process.env.NODE_ENV || 'development';
/**
 * Global error handler for all routes
 * @param {ApiError} err
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export default (err, _req, res, next) => {
  if (res.headersSent) return next(err);
  if (IsApiError(err)) return errorResponse(res, err.message, err.statusCode, err.type);
  if (currentEnv === 'development') {
    console.log(err);
    return errorResponse(res, err.message, 500);
  }
  console.log(err);
  return errorResponse(res, 'Something went wrong', 500);
};
