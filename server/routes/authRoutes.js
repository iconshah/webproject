const express = require('express');
const { checkAuthenticated, checkNotAuthenticated } = require('../helpers/auth');
const { register, emailConfirmation, resetPassword, profile, updateProfile } = require('../controller/authController');
const router = express.Router();
const passport = require('../helpers/passport-config');
const { pool } = require('../helpers/db');
const upload = require('../helpers/multer-config');
// Home route
// Home route
router.get('/', async (req, res) => {
    try {
        const blogQuery = `
            SELECT blogs.id, blogs.title, blogs.content, users.name AS author_name, blogs.created_at
            FROM blogs
            JOIN users ON blogs.author_id = users.id
            ORDER BY blogs.created_at DESC
        `;
        const blogResult = await pool.query(blogQuery);
        const blogs = blogResult.rows;

        const eventQuery = `
            SELECT * FROM sport_events
            WHERE event_date >= NOW()
            ORDER BY event_date ASC
            LIMIT 5
        `;
        const eventResult = await pool.query(eventQuery);
        const events = eventResult.rows;

        res.render('index', { blogs, events, user: req.user });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).render('index', { errors: [{ message: 'Internal server error' }] });
    }
});



// Dashboard route
router.get('/users/dashboard', checkAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user.name });
});

// Profile route
router.get('/users/profile', checkAuthenticated, profile);

// Profile update route
router.post('/users/profile', checkAuthenticated, updateProfile);

// About route
router.get('/users/about', checkAuthenticated, (req, res) => {
    res.render('aboutUs', { user: req.user.name });
});

// Login route
router.get('/users/login', (req, res) => {
    res.render('login', { user: req.user });
});

router.post('/users/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
    successFlash: 'Welcome!',
}));

// Register route
router.get('/users/register', checkNotAuthenticated, (req, res) => {
    res.render('register', { errors: req.flash('error'), success_msg: req.flash('success_msg'), user: req.user });
});

router.post('/users/register', checkNotAuthenticated, register, (req, res) => {
    res.redirect('/users/login');
});

// Forgot password route
router.get('/users/reset-password/:token', (req, res) => {
    res.render('forgot-password', { token: req.params.token });
});

router.post('/users/reset-password/:token', resetPassword, (req, res) => {
    req.flash('success_msg', 'Password reset successful');
    res.redirect('/users/login');
});

// Email confirmation route
router.get('/users/email-confirmation', checkNotAuthenticated, (req, res) => {
    res.render('email-confirmation', { errors: [] });
});

router.post('/users/email-confirmation', checkNotAuthenticated, emailConfirmation, (req, res) => {
    req.flash('success_msg', 'Email confirmed successfully. Please log in.');
    res.redirect('/users/login');
});



// Logout route
router.get('/users/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/users/login');
    });
});

// upload profile picture
router.post('/profile', upload.single('profileImage'), updateProfile);

router.get('/blogs/create', checkAuthenticated, (req, res) => {
    res.render('createBlog', { user: req.user });
});

// Create a blog (POST request)
router.post('/blogs/create', async (req, res) => {
    const { title, content } = req.body;
    const author_id = req.user.id; // Assuming you have a user object with an ID property

    console.log('Received request to create a blog:', { title, content, author_id });

    try {
        const query = `
            INSERT INTO blogs (title, content, author_id) 
            VALUES ($1, $2, $3) 
            RETURNING *, 
            (SELECT name FROM users WHERE id = $3) AS author_name`; // Subquery to fetch author name
        const values = [title, content, author_id];
        const { rows } = await pool.query(query, values);
        console.log('New blog created:', rows[0]);
        req.flash('success_msg', 'Blog created successfully');
        res.redirect('/blogs/all');
    } catch (error) {
        console.error('Error creating blog:', error);
        req.flash('error', 'Internal server error');
        res.redirect('/blogs/all');
    }
});




module.exports = router;
