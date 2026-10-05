require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { allowedOrigins } = require('./utils/allowedOrigins');
const cookieParser = require('cookie-parser');

const app = express();

const allowedOr = allowedOrigins(process.env.ALLOWED_ORIGINS);
const serverPort = process.env.SERVER_PORT;

app.use(cors({
    origin: allowedOr,
    credentials: true
}));

app.use(cookieParser());

app.use(express.json());


// Wiring up all the routes/endpoints
const authRoutes = require('../server/routes/authRoutes');

app.use('/api/auth', authRoutes);



if (require.main === module) {
    app.listen(serverPort, () => {
        console.log(`server running on: ${serverPort}`);
    });
}

app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ message: status === 500 ? 'Internal server error' : err.message });
});

module.exports = app;
