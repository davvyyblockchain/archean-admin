const { User } = require('../../../models');
const middleware = {};

middleware.checkAuth = (req, res, next) => {
    if (req.session['admin_id'] != null && req.session['admin_id'] != undefined) {
        res.redirect("/a/dashboard");
    } else {
        if (req.session['_id'] != null && req.session['_id'] != undefined)
            res.redirect("/");
        else
            return next();
    }
}
middleware.checkAuthAdmin = async (req, res, next) => {
    if (req.session['admin_id'] == null && req.session['admin_id'] == undefined) {
        if (req.session['_id'] != null && req.session['_id'] != undefined)
            res.redirect("/");
        else
            res.redirect(`/a/signin`);
    } else {
        let user = await User.findOne({ _id: req.session['admin_id'] });

        req.session["admin_id"] = user._id;

        return next();
    }
}

module.exports = middleware;