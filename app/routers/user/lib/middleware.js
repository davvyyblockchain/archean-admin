var jwt = require('jsonwebtoken');
const middleware = {};

middleware.verifyToken = (req, res, next) => {
    try {
        console.log('---------------------1')
        // if (!req.session["_id"] && !req.session["admin_id"]) return res.reply(messages.unauthorized());
        console.log('---------------------2')

        var token = req.headers.authorization;
        console.log('---------------------3')

        if (!token) {
            return res.reply(messages.unauthorized());
        }
        token = token.replace('Bearer ', '');
        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {

            console.log('---------------decoded------3',decoded)

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