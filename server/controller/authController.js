const { pool } = require('../helpers/db.js');
const bcrypt = require('bcrypt');
const { sendResetEmail, generateResetToken } = require('../helpers/transporter.js');
require('dotenv').config();

const register = async (req, res) => {
    const { name, email, password, password2 } = req.body;
    const errors = [];

    try {
        if (!name || !email || !password || !password2) {
            errors.push({ message: 'Please enter all fields' });
        }

        if (password.length < 8) {
            errors.push({ message: 'Password must be at least 8 characters long' });
        }

        if (password !== password2) {
            errors.push({ message: 'Passwords do not match' });
        }

        if (errors.length > 0) {
            return res.render('register', { errors });
        }

        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            return res.render('register', { errors: [{ message: 'Email already registered' }] });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [name, email, hashedPassword]);
        req.flash('success_msg', 'You are now registered. Please log in');
        res.redirect('/users/login');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Server error');
        res.redirect('/users/register');
    }
};


const emailConfirmation = async (req, res) => {
    const { email } = req.body;
    const errors = [];

    try {
        if (!email || !email.includes('@') || !email.includes('.')) {
            errors.push({ message: 'Please enter a valid email address' });
        }

        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length === 0) {
            errors.push({ message: 'Email not registered' });
        }

        if (errors.length > 0) {
            return res.render('email-confirmation', { errors, email });
        }

        const token = generateResetToken();
        const resetPasswordExpires = new Date();
        resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1);

        await pool.query('UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3', [token, resetPasswordExpires, email]);

        await sendResetEmail(email, token, req);

        req.flash('success_msg', 'Email sent with password reset instructions');
        res.redirect('/users/login');
    } catch (error) {
        console.error('Error sending email confirmation:', error);
        req.flash('error_msg', 'Failed to send email confirmation');
        res.redirect('/users/email-confirmation');
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, password2 } = req.body;

    try {
        if (!password || !password2 || password !== password2) {
            req.flash('error_msg', 'Passwords do not match');
            return res.redirect(`/users/reset-password/${token}`);
        }

        const user = await pool.query('SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()', [token]);

        if (!user.rows.length) {
            req.flash('error_msg', 'Password reset token is invalid or has expired');
            return res.redirect(`/users/reset-password/${token}`);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await pool.query('UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = $2', [hashedPassword, token]);

        req.flash('success_msg', 'Password reset successfully');
        res.redirect('/users/login');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Server error');
        res.redirect(`/users/reset-password/${token}`);
    }
};
// profile route
const profile = async (req, res) => {
    try {
        // Fetch user data from the database based on the user's ID (assuming you have the user ID stored in req.user.id)
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);

        // Check if the user exists
        if (rows.length === 0) {
            return res.status(404).send('User not found');
        }

        // Pass the user data to the profile view
        res.render('profile', { user: rows[0], title: 'Profile' }); // Pass the title variable
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal server error');
    }
};

// profile update
const updateProfile = async (req, res) => {
    const { name, email } = req.body;
    try {
        // Update the user's name and email
        req.user.name = name;
        req.user.email = email;
        req.flash('success_msg', 'Profile updated successfully');
        res.redirect('/users/profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        req.flash('error', 'Error updating profile');
        res.redirect('/users/profile');
    }
};

module.exports = {
    register,
    emailConfirmation,
    resetPassword, profile, updateProfile
};
