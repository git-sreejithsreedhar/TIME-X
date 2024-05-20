
const isAdmin = (req, res, next) => {
    if(!req.session.admin){
        res.render('admin/adminLogin')
    }
    else{
        next()
    }
}

module.exports = isAdmin
