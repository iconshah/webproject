const express = require('express');
const router = express.Router();
const passport = require('../helpers/passport-config');
const { getAllBlogs, getBlogById, updateBlog, deleteBlog, createBlog } = require('../controller/blogController');
const { checkAuthenticated, checkNotAuthenticated } = require('../helpers/auth');

// Get all blogs
router.get('/all', getAllBlogs);

// Create a blog
router.get('/create', checkAuthenticated, (req, res) => {
    res.render('createBlog');
});

// Handle creation of a blog
router.post('/create', checkAuthenticated, createBlog);

// Get a blog by id
router.get('/:id', getBlogById);

// Update a blog
router.put('/:id', updateBlog);

// Delete a blog
router.delete('/:id', deleteBlog);

module.exports = router;
