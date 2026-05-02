const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { router: authRouter } = require('./auth');
const eventRouter = require('./events');
const bookingRouter = require('./bookings');
const adminRouter = require('./admin');

app.use('/api/auth', authRouter);
app.use('/api/events', eventRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/admin', adminRouter);

app.get('/', (req, res) => {
  res.send('Server is running successfully. Please use the frontend application to interact with the platform.');
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', date: new Date() });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
