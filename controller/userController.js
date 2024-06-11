const User  = require('../model/user')
const Products  = require('../model/products')
const Category = require('../model/category')
const Brand = require('../model/brand')
const passport = require('passport')
const Cart = require('../model/cart')
const Address = require('../model/address')
const Wallet = require('../model/wallet')
const Coupon = require('../model/coupon')
require('dotenv').config()

const isUser = require('../middlewares/isUser')
const isAuth = require('../middlewares/auth')

const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer');
// const transporter = require('transporter')



var bcrypt = require('bcryptjs');
const saltRounds = 10; // Number of salt rounds, higher is better but slower
const saltpassword = bcrypt.genSaltSync(saltRounds);

const { name } = require('ejs')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  })



const userController ={

  
    userhome: async (req,res,next)=>{
       
        try{
           
            const products = await Products.find({ ispublished: true }).populate('category').populate('brand');

        
            res.render('user/home', {
                
                title : 'Home',
                products : products,
                user: req.session.user||req.user
            // const product = await Products.find()
            // const brands = await brands.find()

            // res.render('user/home',{
            //     product: product,
                // brand: brands
            })
        } 
        catch(err){
            next(err)
        }
    },

    getuserRegister: (req,res,next)=>{
        try{
            res.render('user/signIn')
        }
        catch(err){
            next(err)
        }
    },

    //register post

    postuserRegister: async (req, res, next) => {
        try {
            const existingEmail = await User.findOne({ email: req.body.email });
    
            if (existingEmail) {
                return res.render('user/signIn', {
                    alert: 'Email id already exists. Try with another email id.'
                });
            }
    
            bcrypt.genSalt(10, function (err, salt) {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Internal Server Error 1');
                }
                bcrypt.hash(req.body.password, salt, async function (err, hashedPassword) {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Internal Server Error 2');
                    }
                    try {
                        const otp = Math.floor(100000 + Math.random() * 900000);
                        const user = new User({
                            name: req.body.name,
                            email: req.body.email,
                            phone: req.body.phone,
                            pass: hashedPassword,
                            otp: otp
                        });
                        const savedUser = await user.save();
                        const newUserId = savedUser._id;
    
                        const newUser = await User.findOne({ email: req.body.email });
                        const referalCode = req.body.referralcode;
                           
                        if (referalCode) {
                            const referrer = await User.findOne({ referalcode: referalCode });
                          
    
                            if (referrer) {
                                let newUserWallet = await Wallet.findOne({ userId: newUser._id });
    
                                if (newUserWallet) {
                                    await Wallet.findOneAndUpdate({ userId: newUser._id }, { $inc: { balance: 500 } });
                                } else {
                                    await Wallet.create({ userId: newUser._id, balance: 500 });
                                }
    
                                await Wallet.findOneAndUpdate({ userId: referrer._id }, { $inc: { balance: 500 } });
    
                                const mailOptions = {
                                    from: 'sreejithsreedhar96@gmail.com',
                                    to: req.body.email,
                                    subject: 'OTP Verification',
                                    text: `Your OTP is: ${otp}`
                                };
    
                                await transporter.sendMail(mailOptions);
    
                                req.session.tempEmail = req.body.email;
                                return res.render('user/otp', {
                                    title: "OTP",
                                    email: req.session.tempEmail,
                                });
                            } else {

                                await User.findOneAndDelete({ _id: newUserId });

                                return res.render('user/signIn', {
                                    alert: 'Invalid referral code.'
                                });
                            }
                        } else {
                            await Wallet.create({ userId: newUser._id, balance: 0 });
    
                            const mailOptions = {
                                from: 'sreejithsreedhar96@gmail.com',
                                to: req.body.email,
                                subject: 'OTP Verification',
                                text: `Your OTP is: ${otp}`
                            };
    
                            await transporter.sendMail(mailOptions);
    
                            req.session.tempEmail = req.body.email;
                            return res.render('user/otp', {
                                title: "OTP",
                                email: req.session.tempEmail,
                            });
                        }
                    } catch (err) {
                        console.error(err);
                        return res.status(500).send('Internal Server Error 3');
                    }
                });
            });
        } catch (err) {
            next(err);
        }
    },
    
    

    //get otp
    getotp:(req, res, next)=>{
        try{
            res.render('user/otp',{
                title:'OTP Verification',
                email:req.session.tempEmail,
            })

            res.redirect('/login')
        }
        catch(err){
            next(err)
        }
    },
    postsendotp: async (req, res, next) => {
        try {
            const otp = req.body.otp;
            const email = req.session.tempEmail;
    
            const mailOptions = {
                from: 'sreejithsreedhar96@gmail.com', // Sender's email address
                to: email, // Recipient's email address
                subject: 'OTP Verification', // Email subject
                text: `Your OTP is: ${otp}` // Email body
            };
                
            // Send the OTP email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Failed to send OTP' });
                }
                console.log('OTP sent successfully:', info.response);
                res.json({ success: 'OTP sent successfully' });
            });
        } catch (err) {
            console.error(err);
            next(err);
        }
    },

    //post verify otp
    postverifyotp: async (req, res, next)=>{

        const email = req.body.email
        const user = await User.findOne({ email });
        const userEnteredOtp = req.body.otp;

        if(!user) {
            return res.render('otp',{
                email,
                alert:'User not found. Please check your email and try again.'
            })
        }

        if(user.otp === userEnteredOtp){
            req.session.tempEmail = null

            user.isBlocked = false
            user.isVerified = true
            await user.save()

            res.redirect('/user/register',500,{
                otpalert:'OTP verified successfully'
            })
        }
        else{
            res.render('user/otp',{
                title:'OTP',
                email,
                alert:'Invalid OTP. Please try again'
            })
        }
    },

    resendotp: async (req, res, next)=>{
        try{
            req.session.tempEmail = req.body.email
            const userEmail = req.session.tempEmail
            

            const user = await User.findOne({email:userEmail})

            const newOTP = Math.floor(100000 + Math.random() * 900000)

            user.otp = newOTP
            await user.save()

            const mailOptions = {
                from: 'sreejithsreedhar96@gmail.com',
                to: req.body.email,
                subject: 'OTP Verification',
                text: `Your new OTP is: ${newOTP}`,
              }

            await transporter.sendMail(mailOptions)

            req.session.tempEmail = req.body.email
            res.render('user/otp',{
                title: "OTP",   
                email: req.session.tempEmail,
              })
              res.redirect('/login')

        }
        catch(err){
            next(err)
        }
    },
    

//    login get
   getuserLogin:(req,res,next)=>{
    try{
        res.render('user/signIn')
    }
    catch(err){
        next(err)
    }
},


//login post
postuserLogin: async (req,res,next)=>{
    try{
        const data = await User.findOne({email:req.body.email})

        if(data){
            const passwordMatch = await bcrypt.compare(req.body.password,data.pass)
            
            if(data.isVerified==false){
                res.render('user/otp',{
                    title: "OTP",
                    alert: "Your account is not verified. Please check your email for the verification OTP." ,
                    email: req.body.email
                })

            }
            else if(data.isBlocked){
                
                res.render('user/signIn',{
                    alert: 'Sorry! You are blocked.'
                })
            }
            else if(passwordMatch){
                const user = true
                // req.session.user = req.body.email,
                req.session.user = data,
                req.session.isUser = true,
                req.session.userData = data
                // console.log(req.session.user);
                // console.log(req.session.user._id)
                req.session.isLogged = true;
                req.session.userID = data._id;
                // console.log( req.session.userID)

                res.redirect('/userHome',500,{
                    user: req.session.user,
                })
            }
            else{
                res.render('user/signIn',{
                    title:'Login',
                    alert:'Entered Email or Password is incorrect'
                })  
            }
        }
        else{
            res.render('user/signIn',{
                title:'Sign Up',
                signup:'Account does not exist, Please Register.'
            })
        }
    }
    catch(err){
        next(err)
    }
},

// user logout
getlogout: (req, res, next) => {
    try {
        req.session.user = null
        req.user = null
        
        res.render('user/signIn',{
            title:'Login',
            logout:'Logout Successfully',
            
        })
    } catch (err) {
        next(err);
    }
},

//--- get shop page

getshopPage: async (req, res, next) => {
    try {
        const category = req.params.category || undefined;
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        const listedCategories = await Category.find({ isListed: true });
        console.log(category)
        const categoryIds = listedCategories.map(category => category._id);

        let query = { ispublished: true };

        if (category) {
            query.category = category;
        }

        const totalItems = await Products.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);

        // Set default sorting option
        let sort = req.query.sort || 'default';
        console.log(sort);

        // Define default sorting option
        let sortOptions = { created: -1 };

        // Define sorting options based on sort parameter
        if (sort === 'lowToHigh') {
            sortOptions = { price: 1 };
        } else if (sort === 'highToLow') {
            sortOptions = { price: -1 };
        } else if (sort === 'AtoZ') {
            const collation = { locale: 'en', strength: 2 }; // Locale: English, Strength: Secondary
            sortOptions = { productname: 1 };
            // sortOptions = { productname: 1 };
        } else if (sort === 'ZtoA') {
            sortOptions = { productname: -1 };
        } else if (sort === 'newarrivals') {
            sortOptions = { created: -1 };
        }

        // For case-insensitive sorting, use collation
        const collation = { locale: 'en', strength: 2 }; // Locale: English, Strength: Secondary
        const products = await Products.find(query)
            .sort(sortOptions)
            .collation(collation)
            .skip(skip)
            .limit(limit)
            .populate('brand')
            .populate('category');
        const cate = await Category.find({ isListed: true });

        res.render('user/shop', {
            title: 'Shop',
            products: products,
            cate: cate,
            user: req.session.user || req.user,
            sort: sort,
            text: category,
            totalPages: totalPages,
            currentPage: page
        });

    } catch (err) {
        next(err);
    }
},


//--- get product Details
getuserproductdetails : async(req, res, next) =>{

    try{
        if(isUser){
            // const product = await Products.find({})
            const Id = req.params.id;
            const product = await Products.find({_id: Id}).populate('category').populate('brand');

    //         const product = await Products.findOne({ _id: Id })
    // .populate('category')
    // .populate('brand');

            
            await res.render('user/productDetails', {
                product: product
            })
        }
    
    }
    catch(err){
    next(err)
    }

},

getCart : async (req,res,next)=>{
    try{

        const userId = req.session.user._id
        const user = req.session.user
        

       
        const userCart = await Cart.findOne({ userId: userId }).populate({ path: 'items.product', model: 'Product' });
        
        res.render('user/cart',{
            title: 'Cart',
            user: req.session.user||req.user,
            userCart,
            
        })
    }
    catch(err){
        next(err)
    }
},


postaddtoCart: async (req, res, next) => {
    try {
        const productId = req.params.id;
        const quantity = 1;
        const userId = req.session.user._id;
        // console.log(userId)

        const product = await Products.findById(productId);

        if (!product || product.stock === 0) {
            return res.status(400).json({ success: false, message: "Product is out of stock." });
        }

        let usercart = await Cart.findOne({ userId: userId }); 

        if (!usercart) {
            // Create a new cart if the user doesn't have one
            const newCart = new Cart({
                userId: userId,
                items: [{
                    product: productId,
                    price: product.price,
                    quantity: quantity,
                }],
                totalprice: product.price * quantity
            });
            await newCart.save();

            await Products.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });
            return res.status(200).json({ success: true, message: "Item added to cart successfully" });
        } else {
            // Check if the product already exists in the cart
            const existingProductIndex = usercart.items.findIndex(item => item.product.toString() === productId.toString());
            if (existingProductIndex !== -1) {
                // If the product exists, update its quantity
                // usercart.items[existingProductIndex].quantity += quantity;
                return res.status(200).json({ success: true, message: "Item exists in the cart" });
            } else {
                // If the product does not exist, add it to the cart
                usercart.items.push({
                    product: productId,
                    price: product.price,
                    quantity: quantity
                });
            }

            // Update the total price of the cart
            usercart.totalprice = usercart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

            // Save the updated cart
            await usercart.save();

            return res.status(200).json({ success: true, message: "Item added to cart successfully" });
        }
    } catch (error) {
        next(error);
    }
},

//search
// search: async (req, res, next) => {
//     try{
//         const searchTerm = req.query.q;
//         const category = req.params.category || undefined;
//         const sort = req.query.sort;

//         let query = {
//             $or: [
//                 { productname: { $regex: searchTerm, $options: 'i' } },
//                 { description: { $regex: searchTerm, $options: 'i' } },
//             ]
//         };
        

//         if (category) {
//             query.category = category;
//         }

//         let sortOptions = {};
//         if (sort === 'lowToHigh') {
//             sortOptions.newprice = 1;
//         } else if (sort === 'highToLow') {
//             sortOptions.newprice = -1;
//         } else if (sort === 'A-Z') {
//             sortOptions.productname = 1;
//         } else if (sort === 'Z-A') {
//             sortOptions.productname = -1;
//         } else if (sort === 'newarrivals') {
//             sortOptions.created = -1;
//         }

//         let searchResult = await Products.find(query).sort(sortOptions);

//         res.render('search', {
//             products: searchResult,
//             title: 'Dashboard',
//             user: req.session,
//             text: searchTerm
//         });
//     }
//     catch(err){
//         next(err)
//     }
// },



// edit profile
getUserProfile: async (req,res,next) => {
    try{
        const userId = req.params.Id
        const user = await User.findById(userId)


        res.render('user/profile',{
            title: 'Edit Profile',
            users: user,
            user: req.session.userID,

        })
    }
    catch(err){
        next(err)
    }
},


getEditProfile: async (req, res, next) => {
    try {

        const userId  = req.session.user._id
        const user = req.session.user

        const userdata = await User.findOne({_id : userId});

        res.render('user/editProfile',{
            title: 'Edit Profile',
            users: userdata,
            user: userId,

        })


    }
    catch(error) {
        next(error)
    }
},

postEditProfile: async (req, res, next) => {
    try {
        const userId = req.session.user._id

        const updatedProfile =  await User.findByIdAndUpdate(
            userId,
            {
                name: req.body.name,
                phone: req.body.phone,
                email: req.body.email
            },
            { new: true } // to return the updated document
        );
            await User.save
        
        res.render('user/editProfile',{
            title: 'Edit Profile',
            users: updatedProfile,
            user: userId,

        })

    }
    catch(error) {
        next(error)
    }
},


postChangePassword: async (req, res, next) => {
    try {
        const userId = req.session.user._id
        const data = await User.findById(userId)
        const passwordMatch = await bcrypt.compare(req.body.currentpassword,data.pass)
        const hashedpassword = await bcrypt.hash(req.body.newpassword,saltpassword)

        if(passwordMatch){
            await User.findByIdAndUpdate(userId,{
                pass : hashedpassword
            })
            res.render('user/editProfile',{
                message: 'Password Updated Successfully',
                
                users: data,
                user: req.session,
                userId
            })
        }
        else{
            res.render('user/editProfile',{
                alert : 'Entered Wrong current password & Try again',
                user: req.session,
                userId,
            })
        }
    }
    catch(error) {
        next(error)
    }
},

getDashboard: async (req, res, next) => {
    try {

        const userId = req.session.user_id;
        const addressDocument = await Address.findOne({ userId: userId });

        if (addressDocument && addressDocument.addresses) {

            res.render('myprofile', {
                title: 'My profile',
                user: req.session.user,
                addresses: addressDocument.addresses,
                userId
            });
        } else {
            res.render('user/dashboard', {
                title: 'My profile',
                user: req.session.user,
                addresses: []
            });
        }

    }
    catch(error) {
        next(error)
    }
},


getWallet: async (req, res, next) => {
    try {
        const userId = req.session.user._id;

        let usrWallet = await Wallet.findOne({ userId: userId})

        if (!usrWallet) {
            usrWallet = await Wallet.findOneAndUpdate(
                { userId },
                { balance: 0 }, // Set initial balance as 0 or any default value you prefer
                { upsert: true, new: true } // Create a new document if not found
            ); 
        }

        res.render('user/wallet',{
                title: 'Wallet',
                user: req.session,
                userData : req.session.userData,
                userWallet: usrWallet,
                // transactions,
                // totalPages,
                // currentPage
            })

    }
    catch (error) {
        next(error)
    }
},

//add amout to wallet
postAddAmount: async (req,res,next)=>{
    try{
        const userId = req.session.user._id;
        const amount = parseFloat(req.body.amount);

        let userWallet = await Wallet.findOne({ userId: userId });
        if (!userWallet) {
            userWallet = new Wallet({
                userId: userId,
                balance: amount
            });

        } else {
            userWallet.balance += amount;
        }

        await userWallet.save();

        // const transaction = new Transaction({
        //     userId: userId,
        //     amount: amount,
        //     type: 'Credit', 
        //     status: 'Success',
        //     date: new Date() 
        // });

        // await transaction.save();

        res.status(200).json({ success: true });

    }
    catch(err){
        next(err)
    }
},

//check amout in wallet
checkWalletBalance: async (req,res,next) => {
    try {

        const userId = req.session.userID;
        const { totalPrice } = req.body;

        const userWallet = await Wallet.findOne({ userId: userId });

        if (!userWallet) {
            return res.status(404).json({ success: false, message: 'Wallet not found' });
        }

        if (userWallet.balance+1 <= totalPrice) {
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
            
        } else {
            res.json({ success: true, balance: userWallet.balance });
            userWallet.balance -= totalPrice;
            await userWallet.save();

            const transaction = new Transaction({
                userId: userId,
                amount: '-' + totalPrice,
                type: 'Debit',
                status: 'Success',
                date: new Date()
            });
            await transaction.save();
            
        }
        

    } catch(err){
        next(err)
    }
},



}




module.exports = userController