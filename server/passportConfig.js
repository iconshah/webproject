const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { pool } = require('./helpers/db.js');


async function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        try {
            const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            if (user.rows.length === 0) {
                return done(null, false, { message: 'Incorrect email or password' });
            }

            const userFound = user.rows[0];
            bcrypt.compare(password, userFound.password, (err, isMatch) => {
                if (err) {
                    return done(err);
                }
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

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, authenticateUser));

    // Serialize and Deserialize user for session management
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            done(null, user.rows[0]);
        } catch (err) {
            console.error('Error deserializing user:', err);
            done(err);
        }
    });
}

module.exports = initialize;
