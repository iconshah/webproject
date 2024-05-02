const express = require('express');
const router = express.Router();
const { pool } = require('../helpers/db');
const { checkAuthenticated } = require('../helpers/auth');
const { getAllBlogs, getBlogById, updateBlog, deleteBlog } = require('../controller/blogController');

// Get all blogs
router.get('/all', getAllBlogs);

// Get a blog by id
router.get('/:id', getBlogById);

// Get the create blog form


// Update a blog
router.get('/update/:id', checkAuthenticated, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM blogs WHERE id = $1', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        const blog = rows[0];
        res.render('updateBlog', { blog, user: req.user });
    } catch (error) {
        console.error('Error fetching blog by id:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/update/:id', checkAuthenticated, updateBlog);

// Delete a blog
router.post('/delete/:id', checkAuthenticated, deleteBlog);

module.exports = router;

