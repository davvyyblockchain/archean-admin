const {
    User
} = require('../../../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const crypto = require('crypto');
const {
    nodemailer,
    sendgrid
} = require('../../../utils');
const validators = require('./validators');
const controllers = {};

let signJWT = function (user) {
    return jwt.sign({
        id: user._id,
        sRole: user.sRole,
    }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });
}

controllers.register = (req, res) => {
    try {
        if (!req.body.sWalletAddress) return res.reply(messages.required_field('Wallet Address'));
        if (!req.body.sMessage) return res.reply(messages.required_field('Message'));
        if (!req.body.sSignature) return res.reply(messages.required_field('Signature'));
        if (!validators.isValidSignature(req.body)) return res.reply(messages.invalid('Data'));

        bcrypt.hash(req.body.sWalletAddress, saltRounds, (err, hash) => {
            if (err) return res.reply(messages.error())
            if (!req.body.sWalletAddress) return res.reply(messages.required_field('Wallet Address'));

            const user = new User({
                sWalletAddress: _.toChecksumAddress(req.body.sWalletAddress),
                sStatus: "active"
            });

            user.save()
                .then((result) => {
                    let token = signJWT(user);
                    req.session["_id"] = user._id;
                    req.session["sWalletAddress"] = user.sWalletAddress;
                    return res.reply(messages.created('User'), {
                        auth: true,
                        token,
                        sWalletAddress: user.sWalletAddress
                    });
                })
                .catch((error) => {
                    return res.reply(messages.already_exists('User'));
                });
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }
};

controllers.login = (req, res) => {
    try {
        if (!req.body.sWalletAddress) return res.reply(messages.required_field('Wallet Address'));
        if (!req.body.sMessage) return res.reply(messages.required_field('Message'));
        if (!req.body.sSignature) return res.reply(messages.required_field('Signature'));
        if (!validators.isValidSignature(req.body)) return res.reply(messages.invalid('Data'));

        User.findOne({
            sWalletAddress: _.toChecksumAddress(req.body.sWalletAddress)
        }, (err, user) => {
            if (err) return res.reply(messages.error());
            if (!user) return res.reply(messages.not_found('User'));


            if (user && user.sRole == 'user') {

                var token = signJWT(user);

                req.session["_id"] = user._id;
                req.session["sWalletAddress"] = user.sWalletAddress;
                req.session["sUsername"] = user.sUsername;
                return res.reply(messages.successfully('User Login'), {
                    auth: true,
                    token,
                    sWalletAddress: user.sWalletAddress,
                    user: true
                });
            } else {
                return res.reply(messages.invalid('Login'));
            }
        })
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.logout = (req, res, next) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());
        User.findOne({
            _id: req.userId
        }, (err, user) => {
            req.session.destroy();
            if (err) return res.reply(messages.server_error());
            if (!user) return res.reply(messages.not_found('User'));
            return res.reply(messages.successfully('Logout'), {
                auth: false,
                token: null
            });
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }
};

controllers.checkuseraddress = (req, res) => {
    try {
        if (!req.body.sWalletAddress) return res.reply(messages.required_field('Wallet Address'));
        if (!validators.isValidWalletAddress(req.body.sWalletAddress)) return res.reply(messages.invalid('Wallet Address'));

        User.findOne({
            sWalletAddress: _.toChecksumAddress(req.body.sWalletAddress)
        }, (err, user) => {
            if (err) return res.reply(messages.error());
            if (!user) return res.reply(messages.not_found('User'), {
                user: true
            });
            return res.reply(messages.successfully('User Found'), {
                user: true,
                sStatus: user.sStatus
            });
        })
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.adminlogin = (req, res) => {
    try {
        log.green(req.body);
        log.green(req.body.sEmail);
        if (!req.body.sEmail) return res.reply(messages.required_field('Email ID'));
        if (_.isEmail(req.body.sEmail)) return res.reply(messages.invalid('Email ID'));

        User.findOne({
            sEmail: req.body.sEmail
        }, (err, user) => {
            log.error(err);
            if (err) return res.reply(messages.error());
            if (!user) return res.reply(messages.not_found('User'));

            bcrypt.compare(req.body.sPassword, user.sHash, (err, result) => {
                if (result && user.sRole == 'admin') {
                    req.session["admin_id"] = user.id;
                    req.session["admin_firstname"] = user.oName.sFirstname;
                    var token = signJWT(user);
                    return res.reply(messages.successfully('Admin Login'), {
                        auth: true,
                        token,
                        sWalletAddress: user.sWalletAddress,
                        user: false
                    });
                } else {
                    return res.reply(messages.invalid('Password'));
                }
            });
        })
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.passwordReset = (req, res, next) => {
    try {

        log.red(req.body);
        if (!req.body.sEmail) return res.reply(messages.required_field('Email ID'));
        if (_.isEmail(req.body.sEmail)) return res.reply(messages.invalid('Email ID'));

        var randomHash = '';
        crypto.randomBytes(20, function (err, buf) {
            randomHash = buf.toString('hex');
        });

        User.findOne({
            sEmail: req.body.sEmail
        }, (err, user) => {
            if (err) return res.reply(messages.error())
            if (!user) return res.reply(messages.not_found('User'));

            User.findOneAndUpdate({
                    sEmail: user.sEmail
                }, {
                    $set: {
                        sResetPasswordToken: randomHash,
                        sResetPasswordExpires: Date.now() + 600
                    }
                }, {
                    upsert: true
                })
                .then((doc) => {
                })
                .catch((err) => {
                });
            nodemailer.send('forgot_password_mail.html', {
                SITE_NAME: 'Blockchain Australia Solutions',
                USERNAME: user.oName.sFirstname,
                ACTIVELINK: `${process.env.BASE_URL}:${process.env.PORT}/api/v1/auth/reset/${randomHash}`
            }, {
                from: process.env.SMTP_USERNAME,
                to: user.sEmail,
                subject: 'Forgot Password'
            })
            return res.reply(messages.successfully('Email Sent'));
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.passwordResetGet = (req, res, next) => {

    try {

        if (!req.params.token) return res.reply(messages.not_found("Token"));

        User.findOne({
            sResetPasswordToken: req.params.token
        }, function (err, user) {
            if (!user) {
                return res.render('error/token_expire')
            }
            return res.render('Admin/resetPassword')
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }

}

controllers.passwordResetPost = (req, res, next) => {
    try {

        if (!req.params.token) return res.reply(messages.not_found("Token"));
        if (!req.body.sPassword) return res.reply(messages.not_found("Password"));
        if (!req.body.sConfirmPassword) return res.reply(messages.not_found("Confirm Password"));

        if (_.isPassword(req.body.sPassword)) return res.reply(messages.invalid("Password"));
        if (_.isPassword(req.body.sConfirmPassword)) return res.reply(messages.invalid("Password"));

        User.findOne({
            sResetPasswordToken: req.params.token
        }, function (err, user) {
            if (!user) return res.render('error/token_expire')
            if (req.body.sConfirmPassword !== req.body.sPassword)
                return res.reply(messages.bad_request('Password not matched'));

            bcrypt.hash(req.body.sConfirmPassword, saltRounds, (err, hash) => {
                if (err) return res.reply(messages.error());

                user.sHash = hash;
                user.sResetPasswordToken = undefined;
                user.sResetPasswordExpires = undefined;

                user.save((err) => {
                    if (err) return res.reply(messages.error());
                    return res.reply(messages.updated('Password'));
                })
            });
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

module.exports = controllers;