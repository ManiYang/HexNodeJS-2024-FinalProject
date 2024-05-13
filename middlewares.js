const { operationalError } = require('./services/errorHandling');
const processErrorForRespond = require('./services/processErrorForRespond')
const { respondFailed } = require('./services/response');

/**
 * Handles the request body for creating new post or updating existing post.
 */
function handleRequestBodyForPost(req, res, next) {
    if (typeof req.body.content === 'string') {
        req.body.content = req.body.content.trim();
    }

    next();
}

function invalidRouteHandler(req, res, next) {
    throw operationalError(404, '無此路由');
}

function errorHandler(err, req, res, next) {
    const { statusCode, userMessage } = processErrorForRespond(err); 

    const msgObj = { mesage: userMessage };
    if (process.env.NODE_ENV === "dev") {  
        // 只有在 dev 環境才加上 `err` 的資訊
        msgObj.error = err;
        msgObj.stack = err.stack;
    }    

    respondFailed(res, statusCode, msgObj);
}

module.exports = { handleRequestBodyForPost, invalidRouteHandler, errorHandler };
