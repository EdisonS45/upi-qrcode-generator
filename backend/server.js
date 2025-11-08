const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan'); // HTTP request logger
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const allApiRoutes = require('./routes/index');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// --- Core Middleware ---
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true }));

// HTTP Logger
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// --- API Routes ---
// All API routes are prefixed with /api
app.use('/api', allApiRoutes);

// --- Error Handling Middleware ---
// This must be *after* the routes
app.use(notFound); // Handle 404
app.use(errorHandler); // Handle all other errors

// --- Start Server ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});