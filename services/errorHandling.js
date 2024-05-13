
/**
 * @returns A modified version of `asyncFunc`, which catches errors and calls next(err).
 */
function errorHandled(asyncFunc) {
    return (req, res, next) => {
        asyncFunc(req, res, next).catch(err => next(err));
    }
}

function operationalError(statusCode, message) {
    const error = new Error(message);
    error.isOperational = true;
    error.statusCode = statusCode;
    return error;
}

module.exports = { errorHandled, operationalError };
