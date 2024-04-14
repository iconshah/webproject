const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { pool } = require('./db');

// function to generate reset token
function generateResetToken() {
    return crypto.randomBytes(20).toString('hex');
}

// function to send reset password email confirmation
async function sendResetEmail(email, token, req){
    try{

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL, // generated ethereal user
                pass: process.env.PASSWORD // generated ethereal password
            }
        });
        
        // send mail with defined transport object
        await transporter.sendMail({
            to: email, // list of receivers
            from: process.env.EMAIL, // sender address
            subject: 'Password Reset Request', // Subject line
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://${req.headers.host}/users/reset-password/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n` // plain text body
        });
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }
}
    
    module.exports = { 
    sendResetEmail,
    generateResetToken
};