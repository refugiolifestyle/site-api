require('dotenv').config()

const express = require('express');
const next = require('next');
const cors = require('cors');

const port = parseInt(process.env.DOMAIN_PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    // Applying CORS middleware
    server.use(cors({
        methods: "GET, POST, PUT, DELETE, OPTIONS",
        allowedHeaders: "Content-Type, Authorization"
    }));

    server.all('*', (req, res) => {
        return handle(req, res);
    });

    const io = new Server(httpServer);

    io.on("connection", (socket) => {
        console.log(`> Ready connection`, socket);
    });


    server
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, err => {
            if (err) throw err;
            console.log(`> Ready on http://localhost:${port}`);
        });
});