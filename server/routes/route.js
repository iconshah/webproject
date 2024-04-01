const express = require('express');
const passport = require('passport');
const router = express.Router();
const { checkAuthenticated, checkNotAuthenticated } = require('../helpers/auth.js');
const { register} = require('./user.js')
// Routes

router.get('/', (req, res) => {
    res.render('index.ejs');
});


// GET /users/register
router.get('/users/register', checkAuthenticated, (req, res) => {
    res.render('register.ejs');
});

// POST /users/register
router.post('/users/register', register);

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

module.exports = router;
