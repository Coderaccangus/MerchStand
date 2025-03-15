// src/controllers/userController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create a new user with email uniqueness check and password hashing
exports.createUser = async (req, res, next) => {
  try {
    const { contactEmail, password } = req.body;
    
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ contactEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Ensure a password is provided
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    // Hash the plain text password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    req.body.passwordHash = hashedPassword;
    
    // Optionally remove the plain text password from the request body
    delete req.body.password;
    
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
};

// GET all users (returns error if no users found)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// GET a specific user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Validate that the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// PUT to update an existing user by ID
exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// DELETE a user by ID
exports.deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
