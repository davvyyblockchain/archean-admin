const fs = require('fs');
const pinataSDK = require('@pinata/sdk');
const multer = require('multer');
const mongoose = require('mongoose');
const pinata = pinataSDK(process.env.PINATAAPIKEY, process.env.PINATASECRETAPIKEY);
const {
    User,
    NewsLetterEmail,
    Category,
    Aboutus,
    Terms,
    FAQs
} = require('../../../models');
const _ = require('../../../../globals/lib/helper');

const validators = require("./validators");
const controllers = {};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, process.cwd() + '/nft');
    },
    filename: (req, file, callback) => {
        callback(null, new Date().getTime() + '_' + file.originalname);
    }
});
let fileFilter = function (req, file, cb) {
    console.log(file.mimetype)
    var allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb({
            success: false,
            message: 'Invalid file type! Only JPG, JPEG & PNG image files are allowed.'
        }, false);
    }
};

let oMulterObj = {
    storage: storage,
    limits: {
        fileSize: 8 * 1024 * 1024 // 8mb
    },
    fileFilter: fileFilter
};

controllers.profile = (req, res) => {
    try {
        if (!req.userId) {
            return res.reply(messages.unauthorized());
        }
        User.findOne({
            _id: req.userId
        }, {
            oName: 1,
            sUserName: 1,
            sCreated: 1,
            sEmail: 1,
            sWalletAddress: 1,
            sProfilePicUrl: 1,
            sWebsite: 1,
            sBio: 1
        }, (err, user) => {
            if (err) return res.reply(messages.server_error());
            if (!user) return res.reply(messages.not_found('User'));

            console.log("user details found: " + user.sEmail);
            return res.reply(messages.no_prefix('User Details'), user);
        });
    } catch (error) {
        console.log(error);
        return res.reply(messages.server_error());
    }
};

const upload = multer(oMulterObj).single('userProfile');

controllers.updateProfile = async (req, res, next) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());

        // File upload
        let oProfileDetails = {};

        await upload(req, res, async (error) => {

            if (error) return res.reply(messages.bad_request(error.message));

            if (!req.body.sUserName) return res.reply(messages.not_found("Username"));
            if (!req.body.sFirstname) return res.reply(messages.not_found("First Name"));
            if (!req.body.sLastname) return res.reply(messages.not_found("Last Name"));

            if (!validators.isValidString(req.body.sFirstname) || !validators.isValidName(req.body.sFirstname)) return res.reply(messages.invalid("First Name"));
            if (!validators.isValidString(req.body.sLastname) || !validators.isValidName(req.body.sLastname)) return res.reply(messages.invalid("Last Name"));
            if (!validators.isValidString(req.body.sUserName) || !validators.isValidName(req.body.sUserName)) return res.reply(messages.invalid("Username"));

            if (req.body.sWebsite.trim() != "") {
                if (req.body.sWebsite.trim().length > 2083)
                    return res.reply(messages.invalid("Website"));

                const reWebsite = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
                if (!reWebsite.test(req.body.sWebsite.trim()))
                    return res.reply(messages.invalid("Website"));
            }

            if (req.body.sBio.trim() != "")
                if (req.body.sBio.trim().length > 1000)
                    return res.reply(messages.invalid("Bio"));

            await User.findOne({
                sUserName: req.body.sUserName
            }, async (err, user) => {
                if (err) return res.reply(messages.server_error());
                if (user)
                    if (user._id != req.userId)
                        return res.reply(messages.already_exists("User with Username '" + req.body.sUserName + "'"));

                oProfileDetails = {
                    sUserName: req.body.sUserName,
                    oName: {
                        sFirstname: req.body.sFirstname,
                        sLastname: req.body.sLastname
                    },
                    sWebsite: req.body.sWebsite,
                    sBio: req.body.sBio
                }
                if (req.file != undefined) {
                    const aAllowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
                    log.green(req.file.mimetype);
                    if (!aAllowedMimes.includes(req.file.mimetype)) {
                        return res.reply(messages.invalid("File Type"));
                    }
                    const oOptions = {
                        pinataMetadata: {
                            name: req.file.originalname,
                        },
                        pinataOptions: {
                            cidVersion: 0
                        }
                    };

                    const readableStreamForFile = fs.createReadStream(req.file.path);

                    await pinata.pinFileToIPFS(readableStreamForFile, oOptions).then(async (result) => {
                        console.log(result);
                        oProfileDetails["sProfilePicUrl"] = result.IpfsHash;
                        fs.unlinkSync(req.file.path)

                    }).catch((err) => {
                        //handle error here
                        console.log(err);
                        return res.reply(messages.error("From Pinata"));
                    });
                }
                await User.findByIdAndUpdate(req.userId, oProfileDetails,
                    (err, user) => {
                        if (err) return res.reply(messages.server_error());
                        if (!user) return res.reply(messages.not_found('User'));
                        req.session["name"] = req.body.sFirstname;
                        return res.reply(messages.updated('User Details'));
                    });

            });

        })
    } catch (error) {
        console.log(error);
        return res.reply(messages.server_error());
    }
}

controllers.addCollaborator = async (req, res) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());
        if (!req.body) return res.reply(messages.not_found("Collaborator Details"));

        if (!validators.isValidWalletAddress(req.body.sAddress)) return res.reply(messages.invalid("Collaborator Address"));
        if (!validators.isValidString(req.body.sFullname) || !validators.isValidName(req.body.sFullname)) return res.reply(messages.invalid("Collaborator Name"));

        req.body.sAddress = _.toChecksumAddress(req.body.sAddress);

        let aUsers = await User.find({
            sWalletAddress: req.body.sAddress
        });

        if (!aUsers.length) return res.reply(messages.bad_request("User with the given address is not registered"));

        User.findById(req.userId, (err, user) => {
            if (err) return res.reply(messages.server_error());
            if (!user) return res.reply(messages.not_found('User'));

            if (user.sWalletAddress == req.body.sAddress) return res.reply(messages.bad_request("You Can't Add Yourself As a Collaborator"));

            let aUserCollaborators = user.aCollaborators;
            let bAlreadyExists;
            aUserCollaborators.forEach(oCollaborator => {
                if (oCollaborator.sAddress == req.body.sAddress) bAlreadyExists = true;
            });

            if (bAlreadyExists) return res.reply(messages.already_exists("Collaborator"));

            oCollaboratorDetails = {
                $push: {
                    aCollaborators: [req.body]
                }
            }
            User.findByIdAndUpdate(req.userId, oCollaboratorDetails, (err, user) => {
                if (err) return res.reply(messages.server_error());
                if (!user) return res.reply(messages.not_found('User'));

                return res.reply(messages.successfully('Collaborator Added'));
            });
        });

    } catch (error) {
        console.log(error);
        return res.reply(messages.server_error());
    }
};

controllers.collaboratorList = async (req, res) => {
    try {
        // Per page limit
        var nLimit = parseInt(req.body.length);
        // From where to start
        var nOffset = parseInt(req.body.start);

        let oAggregation = [{
                "$match": {
                    "$and": [{
                        "_id": {
                            $eq: mongoose.Types.ObjectId(req.userId)
                        }
                    }]
                }
            },
            {
                "$project": {
                    "totalCollaborators": {
                        $cond: [{
                            $not: ["$aCollaborators"]
                        }, 0, {
                            $size: "$aCollaborators"
                        }]
                    },
                    "aCollaborators": {
                        $cond: [{
                                $not: ["$aCollaborators"]
                            },
                            [], {
                                $slice: ["$aCollaborators", nOffset, nLimit]
                            }
                        ]
                    }
                }
            }
        ];

        let aUsers = await User.aggregate(oAggregation);

        let data = aUsers[0].aCollaborators;

        return res.status(200).json({
            message: 'Collaborator List Details',
            data: data,
            draw: req.body.draw,
            "recordsTotal": aUsers[0].totalCollaborators,
            "recordsFiltered": aUsers[0].totalCollaborators,
        });
    } catch (error) {
        console.log(error);
        return res.reply(messages.server_error());
    }
};

controllers.getCollaboratorList = (req, res) => {
    try {
        User.findById(req.userId, (err, user) => {
            if (err) return res.reply(messages.server_error());
            if (!user) return res.reply(messages.not_found('User'));
            return res.reply(messages.successfully('Collaborator Detials'), user.aCollaborators);
        });
    } catch (error) {
        console.log(error);
        return res.reply(messages.server_error());
    }
};

controllers.addNewsLetterEmails = async (req, res) => {
    try {
        if (!req.body.sName || !req.body.sEmail) return res.reply(messages.required_field("Name and Email "));
        if (_.isEmail(req.body.sEmail)) return res.reply(messages.invalid('Email'));
        if (_.isUserName(req.body.sName)) return res.reply(messages.invalid('Username'));

        const newsLetterEmail = new NewsLetterEmail({
            sName: req.body.sName,
            sEmail: req.body.sEmail
        });
        newsLetterEmail.save()
            .then((result) => {
                console.log('Name and Email added successfully', result);
                return res.reply(messages.success(), {
                    Name: req.body.sName,
                    Email: req.body.sEmail
                });
            })
            .catch((error) => {
                if (error.code == 11000)
                    return res.reply(messages.already_exists('Email'));
                return res.reply(messages.error());
            });
    } catch (err) {
        console.log(err);
        return res.reply(messages.server_error());
    }
};

controllers.deleteCollaborator = (req, res) => {
    log.green(req.params.collaboratorAddress);
    try {
        if (!req.userId) return res.reply(messages.unauthorized());
        if (!req.params.collaboratorAddress) return res.reply(messages.not_found("Collaborator Address"));

        if (!validators.isValidWalletAddress(req.params.collaboratorAddress)) return res.reply(messages.invalid("Collaborator Address"));

        User.findById(req.userId, (err, user) => {
            if (err) return res.reply(messages.server_error());
            if (!user) return res.reply(messages.not_found('User'));

            let aUserCollaborators = user.aCollaborators;

            aUserCollaborators.forEach((oCollaborator, index) => {
                if (oCollaborator.sAddress == req.params.collaboratorAddress) {
                    aUserCollaborators[index] = aUserCollaborators[aUserCollaborators.length - 1];
                    aUserCollaborators.pop();
                    return;
                }
            });

            user.aCollaborators = aUserCollaborators;

            User.findByIdAndUpdate(req.userId, user, (err, user) => {
                if (err) return res.reply(messages.server_error());
                if (!user) return res.reply(messages.not_found('User'));

                return res.reply(messages.successfully('Collaborator Deleted'));
            });
        });
    } catch (error) {
        console.log(error);
        return res.reply(messages.server_error());
    }


}

controllers.getCollaboratorName = (req, res) => {
    log.green(req.params.collaboratorAddress);
    try {
        if (!req.userId) return res.reply(messages.unauthorized());
        if (!req.params.collaboratorAddress) return res.reply(messages.not_found("Collaborator Address"));

        if (!validators.isValidWalletAddress(req.params.collaboratorAddress)) return res.reply(messages.invalid("Collaborator Address"));

        User.findById(req.userId, (err, user) => {
            if (err) return res.reply(messages.server_error());
            if (!user) return res.reply(messages.not_found('User'));

            let aUserCollaborators = user.aCollaborators;

            if (!aUserCollaborators[0]) return res.reply(messages.not_found('Collaborator'));

            let oCollaborator;

            aUserCollaborators.forEach(collaborator => {
                if (collaborator.sAddress == req.params.collaboratorAddress) {
                    oCollaborator = collaborator;
                    return;
                }
            });

            return res.reply(messages.successfully('Details Found'), oCollaborator);
        });
    } catch (error) {
        console.log(error);
        return res.reply(messages.server_error());
    }
}

controllers.editCollaborator = async (req, res) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());
        if (!req.body) return res.reply(messages.not_found("Collaborator Details"));

        if (!validators.isValidWalletAddress(req.body.sAddress)) return res.reply(messages.invalid("Collaborator Address"));
        if (!validators.isValidWalletAddress(req.body.sPreviousAddress)) return res.reply(messages.invalid("Previous Address"));
        if (!validators.isValidString(req.body.sFullname) || !validators.isValidName(req.body.sFullname)) return res.reply(messages.invalid("Collaborator Name"));

        req.body.sAddress = _.toChecksumAddress(req.body.sAddress);

        let aUsers = await User.find({
            sWalletAddress: req.body.sAddress
        });

        if (!aUsers.length) return res.reply(messages.bad_request("User with the given address is not registered"));

        User.findById(req.userId, (err, user) => {
            if (err) return res.reply(messages.server_error());
            if (!user) return res.reply(messages.not_found('User'));

            if (user.sWalletAddress == req.body.sAddress) return res.reply(messages.bad_request("You Can't Add Yourself As a Collaborator"));

            let aUserCollaborators = user.aCollaborators;
            aUserCollaborators.forEach((oCollaborator, index) => {
                if (oCollaborator.sAddress == req.body.sPreviousAddress) {
                    aUserCollaborators[index].sFullname = req.body.sFullname;
                    aUserCollaborators[index].sAddress = req.body.sAddress;
                    return;
                }
            });
            user.aCollaborators = aUserCollaborators;
            User.findByIdAndUpdate(req.userId, user, (err, user) => {
                if (err) return res.reply(messages.server_error());
                if (!user) return res.reply(messages.not_found('User'));

                return res.reply(messages.successfully('Collaborator Updated'));
            });
        });

    } catch (error) {
        console.log(error);
        return res.reply(messages.server_error());
    }
}

controllers.getCategories = async (req, res) => {
    try {
        const aCategories = await Category.find({
            sStatus: {
                $ne: "Deactivated"
            }
        }, {
            _id: 0,
            sName: 1
        }).sort({
            sName: 1
        });

        return res.reply(messages.success(), {
            aCategories
        });
    } catch (error) {
        log.red(error)
        return res.reply(messages.server_error());
    }
}

controllers.getAboutusData = async (req, res) => {
    try {
        const aAboutus = await Aboutus.findOne({}, {
            _id: 0
        }).sort({
            _id: -1
        });
        return res.reply(messages.success(), {
            aAboutus
        });
    } catch (error) {
        log.red(error)
        return res.reply(messages.server_error());
    }
}

controllers.getFAQsData = async (req, res) => {
    try {
        const aFAQs = await FAQs.find({}, {
            _id: 0
        });
        return res.reply(messages.success(), aFAQs);
    } catch (error) {
        log.red(error)
        return res.reply(messages.server_error());
    }
}

controllers.getTermsData = async (req, res) => {
    try {
        const aTerms = await Terms.findOne({}, {
            _id: 0
        }).sort({
            _id: -1
        });
        return res.reply(messages.success(), {
            aTerms
        });
    } catch (error) {
        log.red(error)
        return res.reply(messages.server_error());
    }
}

module.exports = controllers;