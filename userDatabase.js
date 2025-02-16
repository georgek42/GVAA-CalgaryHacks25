const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable cross-origin requests

// Connect to MongoDB Atlas (remote database)
const mongoURI = process.env.MONGO_URI || 'your_mongodb_atlas_connection_string';

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit process on failure
    }
};

connectToMongoDB(); // Call function to connect

// Define the User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    portfolio: { type: Map, of: Number, default: {} }, // Store stocks as { "AAPL": 10, "TSLA": 5 }
    created_at: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password_hash')) {
        this.password_hash = await bcrypt.hash(this.password_hash, 10);
    }
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
};

const User = mongoose.model('User', userSchema);

// Register a new user
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const user = new User({ username, email, password_hash: password });
        await user.save();
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// Login an existing user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await user.comparePassword(password);
        if (isMatch) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(400).json({ message: 'Invalid password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error during login', error });
    }
});

// Update stock portfolio
app.post('/update-portfolio', async (req, res) => {
    const { username, stocks } = req.body; // Example: { "AAPL": 10, "TSLA": 5 }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Update portfolio
        user.portfolio = stocks;
        await user.save();

        res.status(200).json({ message: 'Portfolio updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating portfolio', error });
    }
});

// Get user portfolio
app.get('/portfolio/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(200).json({ portfolio: user.portfolio });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching portfolio', error });
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
