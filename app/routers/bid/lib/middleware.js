var jwt = require('jsonwebtoken');
const middleware = {};

middleware.verifyToken = (req, res, next) => {
    try {
        // if (!req.session["_id"]) return res.reply(messages.unauthorized());
        var token = req.headers.authorization;
        if (!token) {
            return res.reply(messages.unauthorized());
        }
        token = token.replace('Bearer ', '');
        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) return res.reply(messages.unauthorized());

            if (decoded.sRole === "user") {
                req.userId = decoded.id ? decoded.id : '';
                req.role = decoded.sRole ? decoded.sRole : '';
                req.name = decoded.oName ? decoded.oName: '';
                req.email = decoded.sEmail?  decoded.sEmail :'';

console.log('--------req.userId --------',req.userId );
console.log('--------req.role --------',req.role )
console.log('--------req.email --------',req.email )

console.log('--------req.name --------',req.name )

                next();
            } else
                return res.reply(messages.unauthorized());
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }
}
module.exports = middleware;