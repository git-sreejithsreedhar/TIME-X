

// const isUser = (req, res, next) => {
//     if (!req.session.user || !req.user) {
//         
//         res.redirect('/user/register'); 
//     } else {
//         
//         next(); 
//     }
// };

const isUser = (req, res, next) => {
    if (req.session.user || req.user) {
        next();
    } else {
        res.redirect('/user/register'); 
    }
};

module.exports = isUser;



