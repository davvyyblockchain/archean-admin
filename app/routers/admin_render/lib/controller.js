const controllers = {};

controllers.dashboard = (req, res) => {
    return res.render('Admin/dashboard', {
        req: req,
        res: res
    });
}

controllers.profile = (req, res) => {
    return res.render('Admin/profile', {
        req: req,
        res: res
    });
}

controllers.users = (req, res) => {
    return res.render('Admin/users', {
        req: req,
        res: res
    });
}

controllers.nfts = (req, res) => {
    return res.render('Admin/nfts', {
        req: req,
        res: res
    })
}

controllers.signin = (req, res) => {
    return res.render('Admin/signin', {
        req: req,
        res: res
    });
}

controllers.forgotPassword = (req, res) => {
    return res.render('Admin/forgotPassword')
};

controllers.commission = (req, res) => {
    return res.render('Admin/commission', {
        req: req,
        res: res
    });
}

controllers.newsLetterPage = (req, res) => {
    return res.render('Admin/NewsLetterPage', {
        req: req,
        res: res
    });
};

controllers.categories = (req, res) => {
    return res.render('Admin/categories', {
        req: req,
        res: res
    });
}

controllers.aboutus = (req, res) => {
    return res.render('Admin/aboutus', {
        req: req,
        res: res
    });
}

controllers.terms = (req, res) => {
    return res.render('Admin/terms', {
        req: req,
        res: res
    });
}

controllers.faqs = (req, res) => {
    return res.render('Admin/faqs', {
        req: req,
        res: res
    });
}

controllers.composeMail = (req, res) => {
    return res.render('Admin/composeMail', {
        req,
        res
    });
}
module.exports = controllers;