// Middleware functions to check if user is authenticated
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // Proceed to the next middleware or route handler
    }
    res.redirect("/users/login"); // Redirect unauthenticated users to the login page
}

function checkNotAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        return next(); // Proceed to the next middleware or route handler
    }
    res.redirect("/users/dashboard"); // Redirect authenticated users away from login/register routes
}

module.exports = { checkAuthenticated, checkNotAuthenticated };
