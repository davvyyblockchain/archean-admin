/* eslint-disable no-var */
/* eslint-disable no-use-before-define */
require('dotenv').config()
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
process.env.HOST = process.env.HOST || '127.0.0.1';
process.env.PORT = 3000;

process.env.NETWORK_RPC_URL = process.env.NETWORK_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545"

const oEnv = {};

oEnv.dev = {
    BASE_URL: process.env.URL,
    BASE_API_PATH: '',
    DB_URL: process.env.DB_URL,
};

oEnv.stag = {
    BASE_URL: '',
    BASE_API_PATH: '',
    DB_URL: '',
};

oEnv.prod = {
    BASE_URL: '',
    BASE_API_PATH: '',
    DB_URL: '',
};

oEnv.test = {
    BASE_URL: '127.0.0.1',
    BASE_API_PATH: '',
    DB_URL: 'mongodb://localhost:27017/test-NFT-Blockchain-Australia',
};
process.env.BASE_URL = oEnv[process.env.NODE_ENV].BASE_URL;
process.env.BASE_API_PATH = oEnv[process.env.NODE_ENV].BASE_API_PATH;
process.env.JWT_SECRET = 'jwt-secret';
process.env.DB_URL = oEnv[process.env.NODE_ENV].DB_URL;

process.env.OTP_VALIDITY = 60 * 1000;
process.env.SUPPORT_EMAIL = '';
process.env.AWS_ACCESSKEYID = '';
process.env.AWS_SECRETKEY = '';

process.env.ROUNDSMS_API_KEY = '';

process.env.AWS_REGION = '';

process.env.SMTP_HOST = 'smtp.gmail.com' || 'smtp.sendgrid.net';
process.env.SMTP_PORT = 465;
process.env.SMTP_USERNAME = process.env.SMTP_USERNAME || 'example@gmail.com'; // SMTP email
process.env.SMTP_PASSWORD = process.env.SMTP_PASSWORD || 'example@123'; // Your password

process.env.PINATAAPIKEY = process.env.PINATAAPIKEY;
process.env.PINATASECRETAPIKEY = process.env.PINATASECRETAPIKEY;

// console.log(process.env.NODE_ENV, process.env.HOST, 'configured');