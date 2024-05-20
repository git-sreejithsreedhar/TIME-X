

// const isUser = (req, res, next) => {
//     if(!req.session.user || req.user){
//         res.render('/user/register')
//         next()
//     } else {
//         res.redirect('/user/register')
//     }
// }


// module.exports = isUser;



const isUser = (req, res, next) => {
    if (!req.session.user || !req.user) {
        // If neither session user nor user is defined, user is not logged in
        res.redirect('/user/register'); // Redirect to registration page
    } else {
        // If session user or user is defined, user is logged in
        next(); // Proceed to the next middleware
    }
};

module.exports = isUser;



