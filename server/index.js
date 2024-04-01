const express = require('express');
const cors = require('cors'); // Import cors for cross-origin requests
const path = require('path'); // Import path for file paths
const session = require('express-session'); // Import express-session for session management
const flash = require('express-flash'); // Import express-flash for flash messages like You are now registered. Please log in
const passport = require('passport');  // Import passport for authentication
const initializePassport = require('./passportConfig'); // Import the initializePassport function from passportConfig.js
const userRouter = require('./routes/route'); // Import the userRouter from routes/user.js

const app = express();
const port = process.env.PORT || 3000;

// Set the view engine to EJS and the views directory to ../public/views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public/views'));

// Middleware setup
app.use(express.json());
app.use(cors()); // Use cors
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

initializePassport(passport); 

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/', userRouter); // Mount the userRouter at root level

// Start the server
app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});
