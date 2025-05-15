const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet = require('helmet');
const fs = require('fs');
const https = require('https');

const app = express();

// Create a write stream for logging
const logStream = fs.createWriteStream('/app/logs/frontend.log', { flags: 'a' });

// Redirect console.log and console.error to the log file
console.log = (message) => {
    logStream.write(`[LOG] ${new Date().toISOString()} - ${message}\n`);
};
console.warn = (message) => {
    logStream.write(`[WARN] ${new Date().toISOString()} - ${message}\n`);
};
console.error = (message) => {
    logStream.write(`[ERROR] ${new Date().toISOString()} - ${message}\n`);
};

// Set Content-Security-Policy to allow Google Fonts and Bootstrap's CSS and JS
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
                imgSrc: ["'self'", 'data:', 'https://localhost:3000'],
            },
        },
    })
);

// Serve static files
app.use(express.static('./'));

// Load SSL certificates
const sslOptions = {
    key: fs.readFileSync('/app/certs/server.key'),
    cert: fs.readFileSync('/app/certs/server.crt'),
};

// Proxy API requests
app.use('/auth', createProxyMiddleware({
    target: 'https://backend:8000',
    changeOrigin: true,
    secure: false, // Disable SSL verification for self-signed certificates
}));

// Start HTTPS server
const PORT = 3000;
https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Frontend running at https://localhost:${PORT}`);
});