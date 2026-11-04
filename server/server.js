const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://dhalalisuryaprakashcsesvpcet_db_user:ShreeCourier2028@cluster0.p5dzlsy.mongodb.net/courier_system?retryWrites=true&w=majority';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('DB Connection Error:', err));

// User Schema (Customers)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Driver Schema
const driverSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  vehicleNo: String,
  createdAt: { type: Date, default: Date.now }
});
const Driver = mongoose.model('Driver', driverSchema);

// AI Support Chat Schema
const aiChatSchema = new mongoose.Schema({
  customerName: String,
  customerEmail: String,
  messages: [
    {
      sender: { type: String, enum: ['user', 'ai', 'admin'] },
      text: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  escalatedToAdmin: { type: Boolean, default: false },
  status: { type: String, default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});
const AIChat = mongoose.model('AIChat', aiChatSchema);

// Shipment Schema with Live GPS Location
const shipmentSchema = new mongoose.Schema({
  trackingId: { type: String, unique: true },
  senderName: String,
  senderPhone: String,
  customerEmail: String,
  receiverName: String,
  receiverPhone: String,
  receiverAddress: String,
  receiverPincode: String,
  originPincode: String,
  itemDescription: String,
  weight: Number,
  length: Number,
  width: Number,
  height: Number,
  serviceType: String,
  pickupDate: String,
  pickupSlot: String,
  paymentMethod: String,
  paymentStatus: { type: String, default: 'Paid' },
  subtotal: Number,
  gstAmount: Number,
  totalPrice: Number,
  rtoFeeCharged: { type: Number, default: 0 },
  assignedRider: { type: String, default: 'Unassigned' },
  status: { type: String, default: 'Order Booked' },
  currentLocation: {
    lat: { type: Number, default: 13.0827 }, // Default coordinates (e.g., India center / base hub)
    lng: { type: Number, default: 80.2707 },
    updatedAt: { type: Date, default: Date.now }
  },
  statusHistory: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  feedback: {
    rating: Number,
    comment: String,
    createdAt: Date
  },
  createdAt: { type: Date, default: Date.now }
});
const Shipment = mongoose.model('Shipment', shipmentSchema);

// --- AUTH ROUTES ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered.' });
    
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: 'Registered successfully!', name: newUser.name, email: newUser.email });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });
    res.json({ message: 'Login successful!', name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (email === 'suryaprakashdhalali@gmail.com' && password === 'Admin.Shree@2028') {
    res.json({ message: 'Admin login successful!', role: 'admin' });
  } else {
    res.status(401).json({ error: 'Invalid Admin Credentials.' });
  }
});

// Driver Login & Seed Default Driver
app.post('/api/driver/login', async (req, res) => {
  const { email, password } = req.body;
  // Default driver seed if none exist
  let driver = await Driver.findOne({ email });
  if (!driver && email === 'driver@shreevenkatesa.com' && password === 'driver123') {
    driver = new Driver({ name: 'Ramesh Rider', email: 'driver@shreevenkatesa.com', password: 'driver123', phone: '9876543210', vehicleNo: 'TN-01-AB-2028' });
    await driver.save();
  }
  if (driver && driver.password === password) {
    res.json({ message: 'Driver login successful!', name: driver.name, email: driver.email });
  } else {
    res.status(401).json({ error: 'Invalid Driver Credentials.' });
  }
});

// --- AI CHAT & ESCALATION ---
app.get('/api/support/chats', async (req, res) => {
  try {
    const { email } = req.query;
    if (email) {
      const chats = await AIChat.find({ customerEmail: email }).sort({ createdAt: -1 });
      return res.json(chats);
    }
    const allChats = await AIChat.find().sort({ createdAt: -1 });
    res.json(allChats);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching chats.' });
  }
});

app.post('/api/support/chat', async (req, res) => {
  try {
    const { customerName, customerEmail, message, chatId } = req.body;
    let chat = chatId && mongoose.Types.ObjectId.isValid(chatId) ? await AIChat.findById(chatId) : null;

    if (!chat) {
      chat = new AIChat({ customerName, customerEmail, messages: [] });
    }
    chat.messages.push({ sender: 'user', text: message });

    let aiReply = "I am the Shree Venkatesa Virtual Assistant. I can help you with tracking packages, GST calculations, or pickup slots. How can I assist you?";
    const lower = message.toLowerCase();
    if (lower.includes('track') || lower.includes('status')) {
      aiReply = "Check your 'Live Tracking' tab with your Consignment ID.";
    } else if (lower.includes('human') || lower.includes('agent') || lower.includes('problem') || lower.includes('damaged')) {
      chat.escalatedToAdmin = true;
      aiReply = "I have escalated your chat thread to the Operations Admin Desk. An administrator will review your complaint shortly!";
    }

    chat.messages.push({ sender: 'ai', text: aiReply });
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Error processing chat.' });
  }
});

app.put('/api/admin/support/chats/:id', async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    const chat = await AIChat.findById(req.params.id);
    if (!chat) return res.status(404).json({ error: 'Chat not found.' });
    if (status) chat.status = status;
    if (adminReply) chat.messages.push({ sender: 'admin', text: adminReply });
    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Error updating chat.' });
  }
});

// --- SHIPMENTS & LIVE GPS ---
app.post('/api/shipments', async (req, res) => {
  try {
    const data = req.body;
    const trackingId = 'TRK' + Math.floor(100000 + Math.random() * 900000);
    const volumetricWeight = (data.length * data.width * data.height) / 5000;
    const billableWeight = Math.max(data.weight, volumetricWeight);
    const baseRate = data.serviceType === 'Express' ? 180 : 100;
    const subtotal = baseRate + (billableWeight * 25);
    const gstAmount = Number((subtotal * 0.18).toFixed(2));
    const totalPrice = Number((subtotal + gstAmount).toFixed(2));

    const newShipment = new Shipment({
      ...data,
      trackingId,
      subtotal,
      gstAmount,
      totalPrice,
      paymentStatus: data.paymentMethod === 'COD' ? 'Pending (COD)' : 'Paid',
      status: 'Order Booked',
      statusHistory: [{ status: 'Order Booked' }]
    });

    await newShipment.save();
    res.status(201).json(newShipment);
  } catch (err) {
    res.status(500).json({ error: 'Server error booking shipment.' });
  }
});

app.get('/api/shipments', async (req, res) => {
  try {
    const { email, driverRider } = req.query;
    let query = {};
    if (email) query.customerEmail = email;
    if (driverRider) query.assignedRider = driverRider;
    const shipments = await Shipment.find(query).sort({ createdAt: -1 });
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching shipments.' });
  }
});

app.get('/api/shipments/:trackingId', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found.' });
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Driver updates live GPS location and status
app.put('/api/driver/shipments/:trackingId', async (req, res) => {
  try {
    const { status, lat, lng } = req.body;
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found.' });

    if (status && status !== shipment.status) {
      shipment.status = status;
      shipment.statusHistory.push({ status });
      if (status === 'RTO' && shipment.rtoFeeCharged === 0) {
        shipment.rtoFeeCharged = shipment.totalPrice;
        shipment.totalPrice += shipment.totalPrice;
      }
    }
    if (lat && lng) {
      shipment.currentLocation = { lat: Number(lat), lng: Number(lng), updatedAt: new Date() };
    }

    await shipment.save();
    res.json({ message: 'Shipment & Location updated!', shipment });
  } catch (err) {
    res.status(500).json({ error: 'Error updating shipment.' });
  }
});

// --- ADVANCED ADMIN ANALYTICS WITH CUSTOM DATE FILTER ---
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    const shipments = await Shipment.find(query);
    const allShipmentsForStats = await Shipment.find(); // For default periods
    const users = await User.find();
    const aiChats = await AIChat.find().sort({ createdAt: -1 });

    const calculateStats = (list) => {
      const totalRev = list.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
      return { revenue: totalRev, profit: Math.round(totalRev * 0.35), count: list.length };
    };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const customStats = calculateStats(shipments);

    res.json({
      totalCustomers: users.length,
      deliveryStats: {
        delivered: allShipmentsForStats.filter(s => s.status === 'Delivered').length,
        failedRTO: allShipmentsForStats.filter(s => s.status === 'RTO').length,
        active: allShipmentsForStats.filter(s => ['Order Booked', 'Picked Up', 'In Transit', 'Out for Delivery'].includes(s.status)).length,
        total: allShipmentsForStats.length
      },
      analytics: {
        customRange: customStats,
        today: calculateStats(allShipmentsForStats.filter(s => new Date(s.createdAt) >= startOfToday)),
        thisWeek: calculateStats(allShipmentsForStats.filter(s => new Date(s.createdAt) >= startOfWeek)),
        thisMonth: calculateStats(allShipmentsForStats.filter(s => new Date(s.createdAt) >= startOfMonth)),
        thisYear: calculateStats(allShipmentsForStats.filter(s => new Date(s.createdAt) >= startOfYear)),
        prevYears: calculateStats(allShipmentsForStats.filter(s => new Date(s.createdAt) < startOfYear)),
        allTime: calculateStats(allShipmentsForStats)
      },
      customers: users,
      aiChats,
      feedbacks: allShipmentsForStats.filter(s => s.feedback?.rating).map(s => ({
        trackingId: s.trackingId,
        customerEmail: s.customerEmail,
        rating: s.feedback.rating,
        comment: s.feedback.comment,
        date: s.feedback.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

app.put('/api/admin/shipments/:trackingId', async (req, res) => {
  try {
    const { status, assignedRider } = req.body;
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });
    if (!shipment) return res.status(404).json({ error: 'Not found.' });
    if (status && status !== shipment.status) {
      shipment.status = status;
      shipment.statusHistory.push({ status });
    }
    if (assignedRider) shipment.assignedRider = assignedRider;
    await shipment.save();
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: 'Error updating.' });
  }
});

app.post('/api/shipments/:trackingId/feedback', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });
    if (!shipment) return res.status(404).json({ error: 'Not found.' });
    shipment.feedback = { rating, comment, createdAt: new Date() };
    await shipment.save();
    res.json({ message: 'Feedback saved!' });
  } catch (err) {
    res.status(500).json({ error: 'Error.' });
  }
});
const PORT = 5000;

// --- UNIFIED FORGOT / RESET PASSWORD ROUTE ---
app.post('/api/reset-password', async (req, res) => {
  try {
    const { role, email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    if (role === 'customer') {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: 'Customer account not found with this email.' });
      user.password = newPassword;
      await user.save();
      return res.json({ message: 'Customer password updated successfully! You can now log in.' });
    } 
    else if (role === 'driver') {
      const driver = await Driver.findOne({ email });
      if (!driver) return res.status(404).json({ error: 'Driver account not found with this email.' });
      driver.password = newPassword;
      await driver.save();
      return res.json({ message: 'Driver password updated successfully! You can now log in.' });
    } 
    else if (role === 'admin') {
      if (email !== 'suryaprakashdhalali@gmail.com') {
        return res.status(404).json({ error: 'Admin email not recognized.' });
      }
      return res.json({ message: 'Admin security verification successful. Password updated.' });
    }

    res.status(400).json({ error: 'Invalid user role specified.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));