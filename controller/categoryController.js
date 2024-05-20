


const Category = require('../model/category');
const isAdmin = require('../middlewares/isAdmin');

const categoryController = {
    getCategories: async (req, res, next) => {
        try {
            const categories = await Category.find();
            res.render('admin/category', {
                title: 'Categories',
                categories: categories
            });
        } catch (err) {
            next(err);
        }
    },

    getAddcategory: async (req, res, next) => {
        try {
            res.render('admin/addCategory', {
                title: 'Add Category'
            });
        } catch (err) {
            next(err);
        }
    },

    postAddcategory: async (req, res, next) => {
        try {
            const existingCategory = await Category.findOne({ category: req.body.category });
            if (existingCategory) {
                return res.render('admin/addCategory', {
                    title: 'Add Category',
                    alert: 'Category already exists. Please try with another category.'
                });
            }
            const category = new Category({
                category: req.body.category,
                description: req.body.description,
                discount: req.body.discount
            });
            await category.save();
            res.redirect('/admin/category');
        } catch (err) {
            next(err);
        }
    },

    //post edit category
    postEditcategory: async(req,res,next)=>{
        try{

            const existingcategory = await Category.findOne({category:req.body.category})

            
                const Id = req.params.Id
                await Category.findByIdAndUpdate(Id, {
                category: req.body.category,
                description: req.body.description,
                discount: req.body.discount
            })
           
            res.redirect('/admin/category')
        }
        catch(err){
            next(err)
        }
    },

    //edit category
    getEditcategory: async(req, res, next)=>{
        try{
            const Id = req.params.Id
            const category = await Category.findById(Id)
            res.render('admin/editCategory',{
                data:category
            })
        }
        catch(err){
            next(err)
        }
    },

    //publish and unpublish category
    unpublishcategory:async (req,res,next)=>{
        try{
            const Id = req.params.Id
            await Category.findByIdAndUpdate(Id, { isListed: false })
            res.redirect('/admin/category')
        }
        catch(err){
            next(err)
        }
    },
    publishcategory:async (req,res,next)=>{
        try{
            const Id = req.params.Id
            await Category.findByIdAndUpdate(Id, { isListed: true })
            res.redirect('/admin/category',200,{
                title:'Edit Category',

            })
        }
        catch(err){
            next(err)
        }
    },

};

module.exports = categoryController;
