const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { pool } = require('./db');

passport.use(new LocalStrategy({ usernameField: 'email' },
    async (email, password, done) => {
        try {
            // Find the user in the database
            const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            // If the user does not exist
            if (user.rows.length === 0) {
                return done(null, false, { message: 'User not found' });
            }

            // Validate the password
            const match = await bcrypt.compare(password, user.rows[0].password);
            if (!match) {
                return done(null, false, { message: 'Incorrect password' });
            }

            // If authentication is successful, return the user object
            return done(null, user.rows[0]);

        } catch (error) {
            console.error(error.message);
            // Call done with the error parameter
            return done(error);
        }
    }
));

// Serialize the user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize the user
passport.deserializeUser(async (id, done) => {
    try {
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, user.rows[0]);
    } catch (error) {
        console.error(error);
        // Call done with the error parameter
        done(error);
    }
});

module.exports = passport;
