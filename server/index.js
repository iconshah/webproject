const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('./helpers/passport-config');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 3000;

// Set views directory and view engine
app.set('views', path.join(__dirname, '../public/views'));
app.set('view engine', 'ejs');

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Routes
app.use('/', authRoutes);
app.use('/blogs', blogRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err.message);
});

// serve static files
app.use(express.static(path.join(__dirname, '../public')));


// Start server
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
