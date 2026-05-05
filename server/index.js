const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Models
const scrollSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, default: 'none' }, // breaking, update, alert, info, none
  category: { type: String, default: 'scroll' }, // scroll or text
  animation: { type: String, default: 'scroll-left' }, // scroll-left, fade, zoom
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Scroll = mongoose.model('Scroll', scrollSchema);

// Routes
const settingsSchema = new mongoose.Schema({
  displayMode: { type: String, default: 'scroll' }, // 'scroll', 'text', 'both'
  textDuration: { type: Number, default: 5 }, // Duration in seconds
  scrollSpeed: { type: Number, default: 70 } // Duration in seconds for a full scroll
});

const Settings = mongoose.model('Settings', settingsSchema);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Initialize admin if not exists
const initAdmin = async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', password: hashedPassword });
    console.log('Default admin created: admin / admin123');
  }
};
initAdmin();

// Initialize settings if not exists
const initSettings = async () => {
  const count = await Settings.countDocuments();
  if (count === 0) {
    await Settings.create({ displayMode: 'scroll', textDuration: 5, scrollSpeed: 70 });
  }
};
initSettings();

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/auth/verify', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ username: user.username });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Routes
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const updateData = {};
    if (req.body.displayMode) updateData.displayMode = req.body.displayMode;
    if (req.body.textDuration !== undefined) updateData.textDuration = req.body.textDuration;
    if (req.body.scrollSpeed !== undefined) updateData.scrollSpeed = req.body.scrollSpeed;
    
    const settings = await Settings.findOneAndUpdate({}, updateData, { new: true });
    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/scrolls', async (req, res) => {
  try {
    const scrolls = await Scroll.find({ active: true }).sort({ createdAt: 1 });
    res.json(scrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/scrolls', async (req, res) => {
  const scroll = new Scroll({
    text: req.body.text,
    type: req.body.type || 'none',
    category: req.body.category || 'scroll',
    animation: req.body.animation || 'scroll-left'
  });

  try {
    const newScroll = await scroll.save();
    res.status(201).json(newScroll);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/scrolls/:id', async (req, res) => {
  try {
    const updatedScroll = await Scroll.findByIdAndUpdate(
      req.params.id,
      {
        text: req.body.text,
        type: req.body.type,
        category: req.body.category,
        animation: req.body.animation,
        active: req.body.active ?? true
      },
      { new: true }
    );
    res.json(updatedScroll);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/scrolls/:id', async (req, res) => {
  try {
    await Scroll.findByIdAndDelete(req.params.id);
    res.json({ message: 'Scroll deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
