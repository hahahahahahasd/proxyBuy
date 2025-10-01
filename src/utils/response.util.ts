// src/common/utils/response.util.ts

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T | null;
}

/**
 * Creates a standardized success response.
 * @param data The payload to be returned.
 * @param message Optional success message.
 * @returns A success ApiResponse object.
 */
export function successResponse<T>(data: T, message = 'Success'): ApiResponse<T> {
  return {
    success: true,
    code: 200,
    message,
    data,
  };
}

/**
 * Creates a standardized error response.
 * @param message Error message.
 * @param code HTTP-like status code, defaults to 500.
 * @returns An error ApiResponse object.
 */
export function errorResponse(message: string, code = 500): ApiResponse<null> {
  return {
    success: false,
    code,
    message,
    data: null,
  };
}
