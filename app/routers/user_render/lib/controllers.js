const controllers = {};

controllers.landing = (req, res) => {
    return res.render('User/landing')
};
controllers.profile = (req, res) => {
    return res.render('User/profile', {
        req: req,
        res: res
    })
};
controllers.createNFT = (req, res) => {
    return res.render('User/createNFT', {
        req: req,
        res: res
    })
};
controllers.createOption = (req, res) => {
    return res.render('User/createOption', {
        req: req,
        res: res
    })
};
controllers.mynft = (req, res) => {
    return res.render('User/mynft', {
        req: req,
        res: res
    })
};
controllers.addCollaborator = (req, res) => {
    return res.render('User/addCollaborator', {
        req: req,
        res: res
    })
};
controllers.collaboratorList = (req, res) => {
    return res.render('User/collaboratorList', {
        req: req,
        res: res
    })
};
controllers.createCollection = (req, res) => {
    return res.render('User/createCollection', {
        req: req,
        res: res
    })
};
controllers.collectionList = (req, res) => {
    return res.render('User/collectionList', {
        req: req,
        res: res
    })
};
controllers.listing = (req, res) => {
    return res.render('User/listing', {
        req: req,
        res: res
    })
};
controllers.viewNFT = (req, res) => {
    return res.render('User/viewNFT', {
        req: req,
        res: res
    })
};
controllers.manageBid = (req, res) => {
    return res.render('User/manageBid', {
        req: req,
        res: res
    })
};
controllers.transferNFT = (req, res) => {
    return res.render('User/transferNFT', {
        req: req,
        res: res
    })
};
controllers.editCollaborator = (req, res) => {
    return res.render('User/editCollaborator', {
        req: req,
        res: res
    });
};
controllers.aboutus = (req, res) => {
    return res.render('User/aboutus', {
        req: req,
        res: res
    });
}

controllers.terms = (req, res) => {
    return res.render('User/terms', {
        req: req,
        res: res
    });
}

controllers.faqs = (req, res) => {
    return res.render('User/faqs', {
        req: req,
        res: res
    });
}
module.exports = controllers;