const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const getTemplate = (filename, body) => {
    body.dDate = _.formatedDate();
    const emailTemplatePath = path.join(__dirname, 'email_templates', filename);
    const template = fs.readFileSync(emailTemplatePath, { encoding: 'utf-8' });
    return ejs.render(template, body);
};

const collection = {
    verification: (body) => ({
        subject: 'Email verification',
        html: getTemplate('account_activation.html', body),
    }),
    forgotPassword: (body) => ({
        subject: 'Forgot Password',
        html: getTemplate('forgot_password.html', body),
    }),
    adminForgotPassword: (body) => ({
        subject: 'Forgot Password',
        html: getTemplate('admin_forgot_password.html', body),
    }),
    adminCreation: (body) => ({
        subject: 'Subadmin',
        html: getTemplate('newUser.html', body),
    }),
};

const services = {};

services.send = function (type, body, callback) {
    if (process.env.NODE_ENV !== 'prod') return callback();

    return new Promise((resolve, reject) => {
        const param = {
            to: body.sEmail,
            from: process.env.SUPPORT_EMAIL,
            subject: type(body).subject,
            html: type(body).html,
        };
        sgMail
            .send(param)
            .then((response) => (callback ? callback(null, response) : resolve(response)))
            .catch((error) => (callback ? callback(error) : reject(error)));
    });
};

module.exports = { ...services, ...collection };

// const mail = new SendGrid();
// mail.send(mail.verification, { sEmail: 'shivam.m@yudiz.in', sLink: 'https://www.google.com' }, console.log);
