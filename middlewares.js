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
    res.status(404).json({
        status: 'failed',
        message: '無此路由'
    });
}

module.exports = { handleRequestBodyForPost, invalidRouteHandler };
