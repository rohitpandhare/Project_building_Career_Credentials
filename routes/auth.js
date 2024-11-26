const express = require('express');
var authRouter = express.Router();
const db = require('../db-ops/dbHandler');

authRouter.post('/adduser', (req, res) => {
    db.createUser(req, res);
});

authRouter.post('/login', (req, res) => {
    console.log('Login request:', req.body);
    db.doLogin(req, res);
});

authRouter.get('/checkLogin', (req, res) => {
    res.set('Access-Control-Allow-Credentials', true);
    res.json({
        loggedIn: req.session.loggedIn,
        user: req.session.user,
        message: "Loggeed-In: " + req.session.loggedIn
    });
});

authRouter.get('/logout', (req, res) => {
    req.session.loggedIn = false;
    req.session.user = {
        fname: 'Guest',
        lname: 'Guest',
        email: 'Guest',
        uid: 0
    };
    res.status(200).json({
        message: "Logout Successful!!",
        data: {}
    });
});

authRouter.put('/updateUser/:id', (req, res) => {
    console.log("update request", req.body);
    db.updateUser(req, res);
});

authRouter.post('/activate', (req, res) => {
    db.doCud(res, 'update', 'users', new Map(['active', '1']), `where username='${req.body.user}`, `User ${req.body, user} activated!`, 'User Activation failed!');
});

authRouter.post('/deactivate', (req, res) => {
    db.doCud(res, 'update', 'users', new Map(['active', '0']), `where username='${req.body.user}`, `User ${req.body, user} de-activated!`, 'User De-Activation failed!');
});

module.exports = authRouter;
