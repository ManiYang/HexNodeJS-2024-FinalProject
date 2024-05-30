const jwt = require('jsonwebtoken');
const validator = require('validator');

const { operationalError } = require('./services/errorHandling');
const processErrorForRespond = require('./services/processErrorForRespond');
const { respondFailed } = require('./services/response');

/**
 * Handles the request body for creating new post or updating existing post.
 */
function handleRequestBodyForPost(req, res, next) {
    trimObjectProperty(req.body, 'content');
    if (req.body.tags instanceof Array) {
        for (let i = 0; i < req.body.tags.length; ++i) {
            if (typeof req.body.tags[i] !== 'string') continue;
            req.body.tags[i] = req.body.tags[i].trim();
        }
    }

    next();
}

/**
 * Handles the request body for creating new user or updating existing user.
 */
function handleRequestBodyForUser(req, res, next) {
    trimObjectProperty(req.body, 'nickname');
    trimObjectProperty(req.body, 'email');
    trimObjectProperty(req.body, 'password');

    const nicknameMinLength = 2;
    if (req.body.nickname !== undefined 
            && !validator.isLength(req.body.nickname, { min: nicknameMinLength })) {
        throw operationalError(400, `暱稱至少需 ${nicknameMinLength} 個字元`);
    }

    if (req.body.email !== undefined && !validator.isEmail(req.body.email)) {
        throw operationalError(400, 'Email 格式不正確');
    }

    next();
}

function authenticateUser(req, res, next) {
    const authHeaderValue = req.headers.authorization ?? '';
    if (authHeaderValue.startsWith('Bearer ')) {
        const token = authHeaderValue.substring(7);
        
        jwt.verify(token, process.env.JWT_SECRET,  (err, decoded) => {
            if (err) {
                throw operationalError(401, '授權失敗');
            }
            if (decoded.id === undefined) {
                throw new Error('id not found in JWT payload');
            }
            req.userId = decoded.id;
            next();
        });

    } else {
        throw operationalError(401, '授權失敗');
    }
}

function trimObjectProperty(obj, propertyName) {
    if (typeof obj[propertyName] === 'string') {
        obj[propertyName] = obj[propertyName].trim();
    }
}

function invalidRouteHandler(req, res, next) {
    throw operationalError(404, '無此路由');
}

function errorHandler(err, req, res, next) {
    const { statusCode, isOperational, userMessage } =
        processErrorForRespond(err);

    if (!isOperational) {
        // 寫 log
        console.error(`[Non-operational Error] ${err}`); // (暫時用 console.error())
    }

    const msgObj = { message: userMessage };
    if (process.env.NODE_ENV === "dev") {
        // 只有在 dev 環境才加上 `err` 的資訊
        msgObj.errorName = err.name;
        msgObj.error = err;
        msgObj.stack = err.stack;
    }
    respondFailed(res, statusCode, msgObj);
}

module.exports = {
    handleRequestBodyForPost,
    handleRequestBodyForUser,
    authenticateUser,
    invalidRouteHandler,
    errorHandler,
};
