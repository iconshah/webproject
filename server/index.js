const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes/route'); // Adjust the path accordingly
const passport = require('./helpers/passport-config'); // Adjust the path accordingly
const session = require('express-session');
const flash = require('express-flash');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;


app.set('views', path.join(__dirname, '../public/views'));
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

// initialize passport and session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Use the imported routes
app.use('/', routes); // Adjust the path accordingly

app.set('view engine', 'ejs');

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
