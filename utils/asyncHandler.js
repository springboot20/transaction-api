/**
 *
 * @param {Function} callbackFunc
 * @returns
 */
const asyncHandler = (callbackFunc) => {
  return async (req, res, next) => {
    Promise.resolve(callbackFunc(req, res, next)).catch((error) => next(error));
  };
};

export { asyncHandler };
