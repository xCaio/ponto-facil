const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  type: { type: String, enum: ['in', 'out'], required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('timeEntry', timeEntrySchema);