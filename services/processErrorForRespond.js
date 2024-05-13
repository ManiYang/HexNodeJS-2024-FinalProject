
function processErrorForRespond(err) {
    if (err.isOperational === true)  {
        return {
            statusCode: err.statusCode,
            message: err.message
        }
    }


    // temp
    return {
        statusCode: err.statusCode,
        message: err.message
    }

    
    // console.error(err.toString())
    // res.status(500).json({
    //     message: '系統發生問題，請稍後再試'
    // });

    // err.statusCode = 500;
}

module.exports = processErrorForRespond;
