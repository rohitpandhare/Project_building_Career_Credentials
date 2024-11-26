chkLogin = (req, res, next) => {
    if (req.session.hasOwnProperty('loggedIn') && req.session.loggedIn == true) {
        next();
    }
    else {
        res.status(401).json(
            {
                message: "please login",
                data:{message:"You are not logged in"}
            }
        );
    }
}

module.exports = {chkLogin}