
function respondSuccess(res, statusCode, data) {
    res.status(statusCode).json({
        status: 'success',
        data: data
    });
}

module.exports = { respondSuccess };
