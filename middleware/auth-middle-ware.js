const chkLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next(); // User is logged in
    } else {
        console.log('Unauthorized access attempt');
        return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }
};

module.exports = { chkLogin };
