const appConfig = require('../app_config');

function processErrorForRespond(err) {
    let statusCode = 500;
    let isOperational = false;
    let userMessage = '系統發生問題，請稍後再試'; // userMessage 是可被使用者看到的內容

    if (err.isOperational === true)  {
        statusCode = err.statusCode;
        isOperational = true;
        userMessage = err.message;
    } else {
        if (err.name === "ValidationError") {
            statusCode = 400;
            isOperational = true;
            userMessage = '資料欄位未填寫正確，請重新輸入';
        }  
        else if (err.name === 'MongoServerError') {
            const errmsg = err.errorResponse?.errmsg;
            if ((typeof errmsg === 'string') && errmsg.startsWith('E11000 duplicate key error')) {
                if (err.errorResponse.keyValue?.email !== undefined) {
                    statusCode = 400;
                    isOperational = true;
                    userMessage = '帳號已被註冊，請替換新的 Email';
                }
            }
        }
        else if (err.name === 'MulterError') {
            if (err.code === 'LIMIT_FILE_SIZE') {
                statusCode = 400;
                isOperational = true;
                userMessage = `上傳的檔案不可超過 ${appConfig.maxUploadImageSizeMB} MB`;
            }
            else if (err.code === 'LIMIT_FILE_COUNT') {
                statusCode = 400;
                isOperational = true;
                userMessage = '只能上傳一個檔案';
            }
        }
    }

    return { statusCode, isOperational, userMessage };
}

module.exports = processErrorForRespond;
