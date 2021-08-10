var jwt = require('jsonwebtoken');
const middleware = {};

middleware.verifyToken = (req, res, next) => {
    try {
        if (!req.session["_id"]) return res.reply(messages.unauthorized());
        var token = req.headers.authorization;
        if (!token) {
            return res.reply(messages.unauthorized());
        }
        token = token.replace('Bearer ', '');
        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err)
                return res.reply(messages.unauthorized());

            if (decoded.sRole === "user") {
                req.userId = decoded.id;
                req.role = decoded.sRole;
                req.name = decoded.oName;
                req.email = decoded.sEmail;
                next();
            } else
                return res.reply(messages.unauthorized());
        });
    } catch (error) {
        console.log(error);
        return res.reply(messages.server_error());
    }
}
module.exports = middleware;