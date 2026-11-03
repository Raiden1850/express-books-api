const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register a new account
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (
            typeof username !== 'string' ||
            typeof password !== 'string' ||
            username.trim().length < 3 ||
            username.trim().length > 30 ||
            password.length < 8 ||
            password.length > 128
        ) {
            return res.status(400).json({
                error: 'Username must be 3-30 characters and password must be 8-128 characters.'
            });
        }

        const normalizedUsername = username.trim().toLowerCase();

        const existingUser = await User.findOne({
            username: normalizedUsername
        });

        if (existingUser) {
            return res.status(409).json({
                error: 'Username is already taken.'
            });
        }

        const user = new User({
            username: normalizedUsername,
            password
        });

        await user.save();

        res.status(201).json({
            message: 'Account created successfully.'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                error: 'Username is already taken.'
            });
        }

        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Unable to register account.'
        });
    }
});

// Log in and issue a JWT
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (
            typeof username !== 'string' ||
            typeof password !== 'string' ||
            username.length > 30 ||
            password.length > 128
        ) {
            return res.status(400).json({
                error: 'Invalid username or password.'
            });
        }

        const user = await User.findOne({
            username: username.trim().toLowerCase()
        }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                error: 'Invalid username or password.'
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful.',
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Unable to log in.'
        });
    }
});

module.exports = router;