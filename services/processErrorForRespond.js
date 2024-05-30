
function processErrorForRespond(err) {
    let statusCode = 500;
    let isOperational = false;
    let userMessage = '系統發生問題，請稍後再試'; // userMessage 是可被使用者看到的內容

    if (err.isOperational === true)  {
        statusCode = err.statusCode;
        isOperational = true;
        userMessage = err.message;
    } else {
        // errors from mongoose 
        if (err.name === "ValidationError") {
            statusCode = 400;
            isOperational = true;
            userMessage = '資料欄位未填寫正確，請重新輸入';
        }  
        else if (err.name === "MongoServerError") {
            const errmsg = err.errorResponse?.errmsg;
            if ((typeof errmsg === 'string') && errmsg.startsWith('E11000 duplicate key error')) {
                if (err.errorResponse.keyValue?.email !== undefined) {
                    statusCode = 400;
                    isOperational = true;
                    userMessage = '帳號已被註冊，請替換新的 Email';
                }
            }
        }
    }

    return { statusCode, isOperational, userMessage };
}

module.exports = processErrorForRespond;
