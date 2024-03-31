const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { pool } = require('./helpers/db.js');


// initialize function to configure passport
async function initialize(passport) {
    // Function to authenticate user
    const authenticateUser = async (email, password, done) => {
        try {
            const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            // If no user found, return false
            if (user.rows.length === 0) {
                return done(null, false, { message: 'Incorrect email or password' });
            }
            // If user found, compare password
            const userFound = user.rows[0];
            // Compare the password with the hashed password
            bcrypt.compare(password, userFound.password, (err, isMatch) => {
                if (err) {
                    return done(err);
                }
                // If password matches, return user
                if (isMatch) {
                    return done(null, userFound);
                } else {
                    return done(null, false, { message: 'Incorrect email or password' });
                }
            });
        } catch (err) {
            console.error('Error authenticating user:', err);
            return done(err);
        }
    };

    // Use LocalStrategy with email and password fields
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, authenticateUser));

    // Serialize and Deserialize user for session management
    passport.serializeUser((user, done) => done(null, user.id));
    
    passport.deserializeUser(async (id, done) => {
        try {
            // Find user by id
            const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            // If no user found, return false
            done(null, user.rows[0]);
        } catch (err) {
            console.error('Error deserializing user:', err);
            done(err);
        }
    });
}

// Export the initialize function
module.exports = initialize;
