
/**
 * @returns A modified version of `asyncFunc`, which catches errors and calls next(err).
 */
function errorHandled(asyncFunc) {
    return (req, res, next) => {
        asyncFunc(req, res, next).catch(err => next(err));
    }
}

/**
 * @param {number} statusCode 
 * @param {string} userMessage 必須是可以被使用者看到的內容
 * @returns A new instance of `Error`.
 */
function operationalError(statusCode, userMessage) {
    const error = new Error(userMessage);
    error.isOperational = true;
    error.statusCode = statusCode;
    return error;
}

module.exports = { errorHandled, operationalError };
