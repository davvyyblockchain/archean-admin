const {
    User
} = require('../../../models');
const middleware = {};

middleware.checkAuth = (req, res, next) => {

    if (req.session['admin_id'] != null && req.session['admin_id'] != undefined) {
        res.redirect("/a/dashboard");
    } else {
        return next();
    }
}
middleware.checkAuthUser = async (req, res, next) => {
    if (req.session['_id'] == null && req.session['_id'] == undefined) {
        if (req.session['admin_id'] != null && req.session['admin_id'] != undefined)
            res.redirect("/a/dashboard");
        else
            res.redirect("/?" + false);
    } else {
        let user = await User.findOne({
            _id: req.session['_id']
        });

        req.session["_id"] = user._id;

        return next();
    }
}

module.exports = middleware;