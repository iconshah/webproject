const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { pool } = require('../helpers/db.js');
const router = express.Router();

// Routes

router.get('/', (req, res) => {
    res.render('index.ejs');
});


// GET /users/register
router.get('/users/register', checkAuthenticated, (req, res) => {
    res.render('register.ejs');
});

// POST /users/register
router.post('/users/register', async (req, res) => {
    // Extract the name, email, password, and password2 from the request body
    const { name, email, password, password2 } = req.body;
    // Create an empty array to store any errors
    const errors = [];

    // Try to register the user with some basic validation
    try {
        if (!name || !email || !password || !password2) {
            errors.push({ message: 'Please enter all fields' });
        }
        if (password.length < 6) {
            errors.push({ message: 'Password must be at least 6 characters long' });
        }
        if (password !== password2) {
            errors.push({ message: 'Passwords do not match' });
        }

        if (errors.length > 0) {
            return res.render('register', { errors, name, email, password, password2 });
        } 
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);
        // Check if the user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            return res.render('register', { message: 'Email already registered' });
        }
        // Insert the user into the database
        await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hashedPassword]);
        // Redirect to the login page
        req.flash('success_msg', 'You are now registered. Please log in');
        res.redirect('/users/login');
    } catch (error) {
        console.error('Error registering user:', error);
        req.flash('error_msg', 'Failed to register user.');
        res.redirect('/users/register');
    }
});

router.get('/users/login', checkAuthenticated, (req, res) => {
    res.render('login.ejs');
});

router.post('/users/login', passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
}));

router.get('/users/logout', (req, res) => {
    req.logout(() => {
        req.flash('success_msg', 'You have logged out');
        res.redirect('/users/login');
    });
});

router.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
    res.render("dashboard", { user: req.user.name });
});

// Middleware functions to check if user is authenticated
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/users/dashboard");
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/users/login");
}

module.exports = router;
