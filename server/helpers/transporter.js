const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Function to generate reset token
function generateResetToken() {
    return crypto.randomBytes(20).toString('hex');
}

// Function to send reset email
async function sendResetEmail(email, token, req) {
    try {
        // Configure Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        // Send email with reset link
        await transporter.sendMail({
            to: email,
            from: 'stha.roman20@gmail.com',
            subject: 'Password Reset Request',
            text: `Hello, You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                Please click on the following link, or paste this into your browser to complete the process:\n\n
                http://${req.headers.host}/users/reset-password/${token}\n\n
                If you did not request this, please ignore this email and your password will remain unchanged.\n`
        });
    } catch (error) {
        console.error(error);
        throw new Error('Error sending email.');
    }
}


module.exports = { generateResetToken, sendResetEmail };