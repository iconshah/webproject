const express = require('express');
const router = express.Router();
const sportEventController = require('../controller/sportEventController');

// Get all sport events
router.get('/', sportEventController.getAllEvents);

// Get a single sport event by ID
router.get('/:id', sportEventController.getEventById);

// Create a new sport event
router.post('/', sportEventController.createEvent);

// Update a sport event by ID
router.put('/:id', sportEventController.updateEvent);

// Delete a sport event by ID
router.delete('/:id', sportEventController.deleteEvent);

module.exports = router;
