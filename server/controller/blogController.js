const { pool } = require('../helpers/db');
require('dotenv').config();

const getAllBlogs = async (req, res) => {
    const errors = [];
    try {
        const user = req.body; // Get the user from the request
        const title = 'List of Blogs'; // Define the title variable
        const { rows } = await pool.query('SELECT * FROM blogs');
        res.render('blogs', { blogs: rows, title, user});
    } catch (error) {
        console.error('Error fetching blogs:', error);
        errors.push({ message: 'Error fetching blogs' });
        res.render('blogs', { errors });
    }
};
const getBlogById = async (req, res) => {
    try {
        console.log('Blog ID:', req.params.id); // Log the value of the ID
        const { rows } = await pool.query('SELECT * FROM blogs WHERE id = $1', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.render('blogDetail', { blog: rows[0] });
    } catch (error) {
        console.error('Error fetching blog by id:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



const updateBlog = async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }
    try {
        const { rows } = await pool.query('UPDATE blogs SET title = $1, content = $2 WHERE id = $3 RETURNING *', [title, content, req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createBlog = async (req, res) => {
    const { title, content, author_id } = req.body;
    const errors = [];
  
    if (title.length < 5 || title.length > 100) {
      errors.push({ message: 'Title must be between 5 and 100 characters' });
    }
    if (!content) {
      errors.push({ message: 'Content cannot be empty' });
    }
  
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
  
    try {
      const text = 'INSERT INTO blogs (title, content, author_id) VALUES ($1, $2, $3) RETURNING *';
      const values = [title, content, author_id];
      const newBlog = await pool.query(text, values);
      req.flash('success_msg', 'Blog created successfully');
      res.redirect('/blogs/all');
    } catch (error) {
      console.error('Error creating blog:', error);
      req.flash('error', 'Error creating blog');
      res.redirect('/blogs/create'); // Redirect back to create form with error message
    }
};

  


const deleteBlog = async (req, res) => {
    try {
        const { rows } = await pool.query('DELETE FROM blogs WHERE id = $1 RETURNING *', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog
};
