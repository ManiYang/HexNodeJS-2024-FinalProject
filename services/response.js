
function respondSuccess(res, statusCode, data) {
    res.status(statusCode).json({
        status: 'success',
        data: data
    });
}

function respondFailed(res, statusCode, msgObj) {
    res.status(statusCode).json({
        status: 'failed',
        ...msgObj
    });
}

module.exports = { respondSuccess, respondFailed };
