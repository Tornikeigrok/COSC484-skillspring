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

// Every request arrives from proxy's IP, which is same for everyone, coutning tries for everyone
// Trust proxy so we read the real client IP so it's distinct for every user
app.set('trust proxy', 1); 

// Wiring up all the routes/endpoints
const authRoutes = require('../server/routes/authRoutes');
const studentRoutes = require('../server/routes/studentRoutes');
const companyRoutes = require('../server/routes/companyRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/company', companyRoutes);


if (require.main === module) {
    app.listen(serverPort, () => {
        console.log(`server running on: ${serverPort}`);
    });
}

app.use((err, req, res, next) => {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    res.status(status).json({ message: status === 500 ? 'Internal server error' : err.message });
});

module.exports = app;
