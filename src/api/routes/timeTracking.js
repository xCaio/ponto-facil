const express = require('express');
const TimeEntry = require('../models/timeEntry');
const authMiddleware = require('../middleware/authMiddleware');
console.log('authMiddleware:', authMiddleware); // Add this line for debugging

const router = express.Router();

router.post('/', authMiddleware(['admin', 'rh', 'employee']), async (req, res) => {
  const { type, timestamp } = req.body;

  try {
    const timeEntry = new TimeEntry({
      employee: req.employee.id,
      company: req.employee.company,
      type,
      timestamp
    });

    await timeEntry.save();
    res.status(201).json({ message: 'Time entry recorded successfully' });
  } catch (error) {
    console.error('Error creating time entry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', authMiddleware(['admin', 'rh', 'employee']), async (req, res) => {
  const { month, year, userId } = req.query;

  try {
    let query = { company: req.employee.company };

    // Filter by user
    if (req.employee.role === 'employee') {
      query.employee = req.employee.id;
    } else if (userId) {
      query.employee = userId;
    }

    // Filter by month and year
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.timestamp = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      query.timestamp = { $gte: startDate, $lte: endDate };
    }

    const timeEntries = await TimeEntry.find(query)
      .sort({ timestamp: -1 })
      .populate('employee', 'name email'); // Populate employee details

    res.json(timeEntries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;