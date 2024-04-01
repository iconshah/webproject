const { pool } = require('../helpers/db.js'); // Import the pool object from db.js
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

register = async (req, res) => {
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
}

module.exports = { register };