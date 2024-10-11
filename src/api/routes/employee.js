const express = require('express');
const bcrypt = require('bcrypt');
const Employee = require('../models/employee');
const Company = require('../models/company');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Register company and admin
router.post('/register-company', async (req, res) => {
  const { companyName, adminName, email, password } = req.body;

  try {
    let employee = await Employee.findOne({ email });
    if (employee) {
      return res.status(400).json({ message: 'Employee already exists' });
    }

    const company = new Company({ name: companyName });

    employee = new Employee({
      name: adminName,
      email,
      password,
      position: 'Admin',
      role: 'admin',
      company: company._id
    });

    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(password, salt);

    company.admin = employee._id;

    await company.save();
    await employee.save();

    res.status(201).json({ message: 'Company and admin registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register RH or employee (only accessible by admin or RH)
router.post('/register', authMiddleware(['admin', 'rh']), async (req, res) => {
  const { name, email, password, position, role } = req.body;

  // Only admin can create RH users
  if (role === 'rh' && req.employee.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can create RH users' });
  }

  try {
    let employee = await Employee.findOne({ email });
    if (employee) {
      return res.status(400).json({ message: 'Employee already exists' });
    }

    employee = new Employee({
      name,
      email,
      password,
      position,
      role: role || 'employee',
      company: req.employee.company
    });

    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(password, salt);

    await employee.save();

    res.status(201).json({ message: 'Employee registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all employees (only accessible by admin or RH)
router.get('/', authMiddleware(['admin', 'rh']), async (req, res) => {
  try {
    const employees = await Employee.find({ company: req.employee.company }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;