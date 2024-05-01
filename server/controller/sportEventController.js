// controllers/sportEventController.js

const { pool } = require('../helpers/db');

const getAllEvents = async (req, res) => {
    try {
        const query = 'SELECT * FROM sport_events';
        const { rows } = await pool.query(query);
    } catch (error) {
        console.error('Error fetching sport events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getEventById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT * FROM sport_events WHERE event_id = $1';
        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Sport event not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching sport event by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const createEvent = async (req, res) => {
    const { event_name, event_date, event_time, location, home_team, away_team } = req.body;
    try {
        const query = 'INSERT INTO sport_events (event_name, event_date, event_time, location, home_team, away_team) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const values = [event_name, event_date, event_time, location, home_team, away_team];
        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating sport event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { event_name, event_date, event_time, location, home_team, away_team } = req.body;
    try {
        const query = 'UPDATE sport_events SET event_name = $1, event_date = $2, event_time = $3, location = $4, home_team = $5, away_team = $6 WHERE event_id = $7 RETURNING *';
        const values = [event_name, event_date, event_time, location, home_team, away_team, id];
        const { rows } = await pool.query(query, values);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Sport event not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating sport event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteEvent = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM sport_events WHERE event_id = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Sport event not found' });
        }
        res.json({ message: 'Sport event deleted successfully' });
    } catch (error) {
        console.error('Error deleting sport event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};
