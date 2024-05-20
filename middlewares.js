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
    if (req.body.tags instanceof Array) {
        for (let i=0; i < req.body.tags.length; ++i) {
            if (typeof req.body.tags[i] !== 'string')
                continue;
            req.body.tags[i] = req.body.tags[i].trim();
        }
    }

    next();
}

function invalidRouteHandler(req, res, next) {
    throw operationalError(404, '無此路由');
}

function errorHandler(err, req, res, next) {
    const { statusCode, isOperational, userMessage } = processErrorForRespond(err); 

    if (!isOperational) {
        // 寫 log 
        console.error(`[Non-operational Error] ${err}`); // (暫時用 console.error())
    }

    const msgObj = { mesage: userMessage };
    if (process.env.NODE_ENV === "dev") {  
        // 只有在 dev 環境才加上 `err` 的資訊
        msgObj.error = err;
        msgObj.stack = err.stack;
    }    
    respondFailed(res, statusCode, msgObj);
}

module.exports = { handleRequestBodyForPost, invalidRouteHandler, errorHandler };
