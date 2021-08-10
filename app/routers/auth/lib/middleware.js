var jwt = require('jsonwebtoken');
const middleware = {};

middleware.verifyToken = (req, res, next) => {
    try {
        var token = req.headers.authorization;
        if (!token) {
            return res.reply(messages.unauthorized());
        }
        token = token.replace('Bearer ', '');
        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            log.red(err);
            if (err) {
                return res.reply(messages.unauthorized());
            }
            req.userId = decoded.id;
            req.role = decoded.sRole;
            next();
        });
    } catch (error) {
        console.log(error);
        return res.reply(messages.server_error());
    }
}
module.exports = middleware;