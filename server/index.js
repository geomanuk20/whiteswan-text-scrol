const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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
  textDuration: { type: Number, default: 5 } // Duration in seconds
});

const Settings = mongoose.model('Settings', settingsSchema);

// Initialize settings if not exists
const initSettings = async () => {
  const count = await Settings.countDocuments();
  if (count === 0) {
    await Settings.create({ displayMode: 'scroll', textDuration: 5 });
  }
};
initSettings();

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
