const path = require('path');
const express = require("express");
const session = require('express-session');
const mysql = require("mysql2");
const cors = require('cors');

const myApp = express();
const port = 3000;

// Database connection
var conPool = mysql.createPool({
    connectionLimit: 100,
    host: "localhost",
    user: 'root',
    password: 'root',
    database: "to-do-app",
    debug: false,
    waitForConnections: true,
    queueLimit: 0
});

// Middleware
myApp.use(express.static(path.join(__dirname, 'react-front')));
myApp.use(express.json());
myApp.use(express.urlencoded({ extended: true }));

var corsOptions = {
    credentials: true,
    origin: ['http://localhost:3001', 'http://localhost:3005'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 200
};

myApp.use(cors(corsOptions));

myApp.use(session({
    secret: 'AlphaZulu16',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));

myApp.set('views', path.join(__dirname, 'views'));
myApp.set('view engine', 'ejs');

// Importing routes
var authlinks = require('./routes/auth');
var todoRoutes = require('./routes/todoRoutes');

// Middleware
chkLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        req.session.ogPath = req.path;
        res.redirect("/login");
    }
};

// Routes
myApp.use('/auth', authlinks);
myApp.use('/todo', todoRoutes);

// Logout route
myApp.get('/auth/logout', (req, res) => {
    req.session.destroy();
    res.status(200).json({ message: 'Successfully logged out' });
});

// Starting server
myApp.listen(port, () => {
    console.log(`The server is running on http://localhost:${port}`);
});
