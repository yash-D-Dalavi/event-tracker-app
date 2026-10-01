const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Schema for RSVPs & Share Links
const rsvpSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  eventTitle: String,
  userName: String,
  userEmail: String,
  shareCode: { type: String, unique: true },
  clicksCount: { type: Number, default: 0 }
});

const RSVP = mongoose.model('RSVP', rsvpSchema);

// Ticketmaster Event Feed API
app.get('/api/events', async (req, res) => {
  try {
    // Ticketmaster API or Mock Feed
    const mockEvents = [
      { id: '1', name: 'Tech Conference 2026', date: '2026-10-10', venue: 'Convention Center', city: 'Mumbai' },
      { id: '2', name: 'Music Festival Vibe', date: '2026-10-15', venue: 'Open Ground', city: 'Pune' },
      { id: '3', name: 'AI & Cloud Summit', date: '2026-10-20', venue: 'IT Park Auditorium', city: 'Bangalore' }
    ];
    res.json(mockEvents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// RSVP Endpoint
app.post('/api/rsvp', async (req, res) => {
  try {
    const { eventId, eventTitle, userName, userEmail } = req.body;
    const shareCode = Math.random().toString(36).substring(2, 8);
    const newRsvp = new RSVP({ eventId, eventTitle, userName, userEmail, shareCode });
    await newRsvp.save();
    res.json({ message: 'RSVP Successful!', shareLink: `http://localhost:5000/invite/${shareCode}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vibe Check: Share Link Click Tracker
app.get('/invite/:code', async (req, res) => {
  try {
    const rsvp = await RSVP.findOne({ shareCode: req.params.code });
    if (rsvp) {
      rsvp.clicksCount += 1;
      await rsvp.save();
      res.send(`<h2>Thanks for joining via ${rsvp.userName}'s invite!</h2><p>Event: ${rsvp.eventTitle}</p>`);
    } else {
      res.status(404).send('Invalid Link');
    }
  } catch (err) {
    res.status(500).send('Error processing invite');
  }
});

// Fetch Friends Attending Count
app.get('/api/friends-attending/:eventId', async (req, res) => {
  try {
    const rsvps = await RSVP.find({ eventId: req.params.eventId });
    const totalClicks = rsvps.reduce((acc, r) => acc + r.clicksCount, 0);
    res.json({ count: rsvps.length, friendClicks: totalClicks });
  } catch (err) {
    res.status(500).json({ count: 0, friendClicks: 0 });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));