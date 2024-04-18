const express = require('express');
const { pool } = require('../helpers/db');
require('dotenv').config();

const getAllBlogs = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC');
        res.render('blogs', { blogs: rows, title: 'List of Blogs', user: req.user, body: 'Content of the blogs page' });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.render('blogs', { errors: [{ message: 'Error fetching blogs' }], body: 'Error content' });
    }
};


const getBlogById = async (req, res) => {
    const { id } = req.params;


    try {
        const { rows } = await pool.query('SELECT * FROM blogs WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.render('blogDetail', { blog: rows[0], user: req.user, body: 'Content of the blog detail page' });
    } catch (error) {
        console.error('Error fetching blog by id:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        // Check if the title is empty
        if (!title) {
            return res.status(400).send('Title cannot be empty');
        }

        const { rowCount } = await pool.query('UPDATE blogs SET title = $1, content = $2 WHERE id = $3 RETURNING *', [title, content, id]);

        if (rowCount === 0) {
            return res.status(404).send('Blog not found');
        }

        res.redirect(`/blogs/all`, { success_msg: 'Blog updated successfully' , user:req.user, body: 'Content of the blog detail page' , title: 'Blog updated successfully', blog: rows[0], user: req.user });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).send('Internal server error');
    }
};

const deleteBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        // Check if the blog exists
        const { rowCount } = await pool.query('DELETE FROM blogs WHERE id = $1', [blogId]);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Redirect to the blog list page after deletion
        req.flash('success_msg', 'Blog deleted successfully');
        res.redirect('/blogs/all');
    } catch (error) {
        console.error('Error deleting blog:', error);
        req.flash('error', 'Error deleting blog');
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
};
