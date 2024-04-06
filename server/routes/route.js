const express = require('express');
const { register, emailConfirmation, resetPassword } = require('./user');
const passport = require('../helpers/passport-config');
const { checkAuthenticated, checkNotAuthenticated } = require('../helpers/auth');

const router = express.Router();

// Routes

router.get('/', (req, res) => {
    res.render('index.ejs');
});

router.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
    res.render("dashboard", { user: req.user.name });
});
// GET /users/login
router.get('/users/login', checkAuthenticated, (req, res) => {
    res.render('login.ejs');
});

router.post('/users/login', passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
}));

// GET /users/register
router.get('/users/register', checkAuthenticated, (req, res) => {
    res.render('register.ejs');
});

router.post('/users/register', checkNotAuthenticated, register, (req, res) => {
    res.redirect('/users/login');
});
   

// Email confirmation route
router.get('/users/email-confirmation', (req, res) => {
    res.render('email-confirmation', { errors: [] });
});

// Email confirmation done route
router.post('/users/email-confirmation', emailConfirmation, (req, res) => {
    res.render('login');
});

// Forgot password route
router.get('/users/reset-password/:token', (req, res) => {
    res.render('forgot-password', { token: req.params.token });
});

router.post('/users/reset-password/:token', resetPassword, (req, res) => {
    req.flash('success_msg', 'Password reset successful');
    res.redirect(`/users/reset-password/${token}`);
});


router.get('/users/logout', (req, res) => {
    req.logout(() => {
        req.flash('success_msg', 'You have logged out');
        res.redirect('/users/login');
    });
});
module.exports = router;