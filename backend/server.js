const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ProjectFlow API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  let dbUri = process.env.MONGODB_URI;
  let mongoServer;

  // Since we detected no local MongoDB service running on port 27017,
  // let's spin up an in-memory database automatically if configured for localhost or missing.
  if (!dbUri || dbUri.includes('localhost') || dbUri.includes('127.0.0.1')) {
    try {
      console.log('ℹ️ Local MongoDB service not detected. Starting MongoDB Memory Server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      dbUri = mongoServer.getUri();
      console.log('✅ MongoDB Memory Server started at:', dbUri);
    } catch (err) {
      console.error('❌ Failed to start MongoDB Memory Server:', err.message);
    }
  }

  mongoose.connect(dbUri)
    .then(async () => {
      console.log('✅ MongoDB connected successfully');
      try {
        const seedData = require('./config/seeder');
        await seedData();
      } catch (seedErr) {
        console.error('❌ Error during DB seeding:', seedErr.message);
      }
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      process.exit(1);
    });
};

startServer();
