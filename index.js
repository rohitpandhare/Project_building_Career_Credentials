const path = require('path');
const express = require("express");
const session = require('express-session');
const myApp = express();
const port = 3000;
const cors = require('cors');
var authlinks = require('./routes/auth');
const db = require('./db-ops/dbHandler');
const { name } = require('ejs');
var todoRoutes = require('./routes/todoRoutes');

myApp.use(express.static(__dirname + '/react-front'));

myApp.use(express.json());
myApp.use(
    express.urlencoded(
        {
            extended: true
        }
    )
);

var corsOptions = {
    credentials:true,
    AccessControlAllowOrigin: true,
    origin: ['http://localhost:3001','http://localhost:3005'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 200
}

myApp.use(cors(corsOptions));

myApp.use(
    session(
        {
            secret: 'AlphaZulu16',
            resave: true,
            saveUninitialized: true,
            cookie: { secure: false }
        }
    )
)

myApp.set('views', path.join(__dirname, 'views'));
myApp.set('view engine', 'ejs');

chkLogin = (req, res, next) => {
    if (req.session.hasOwnProperty('loggedIn') && req.session.loggedIn == true) {
        next();
    }
    else {
        req.session.ogPath = req.path;
        res.redirect("/login");
    }
}

myApp.get('/usertypes', (req, res) => {
    db.getUserTypes(req, res);
})

myApp.use('/auth',authlinks)
myApp.use('/todo',todoRoutes)

myApp.get('/auth/logout', (req, res) => {
    req.session.destroy();
    res.status(200).json({ message: 'Successfully logged out' });
});

myApp.put('/auth/updateUser/:id', async (req, res) => {
    const userId = req.params.id;
    const { fname, lname, email } = req.body;

    try {
        const updatedUser = await db.User.update(
            { fname, lname, email },
            { where: { id: userId } }
        );

        if (updatedUser[0] === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

myApp.listen(
    port, () => {
        console.log(`The server is running on http://localhost:${port}`)
    }
)
