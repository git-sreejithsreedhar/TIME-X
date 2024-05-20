const User  = require('../model/user')
const Products  = require('../model/products')
const Category = require('../model/category')
const Brand = require('../model/brand')
const passport = require('passport')
const Cart = require('../model/cart')
const Address = require('../model/address')
require('dotenv').config()

const isUser = require('../middlewares/isUser')
const isAuth = require('../middlewares/auth')

const moment = require('moment')
const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer');
// const transporter = require('transporter')

var bcrypt = require('bcryptjs');
const { name } = require('ejs')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  })



const addressController ={

    getAddress: async (req, res, next) => {
        try{
            
            const user = req.session.user
            const userId = req.session.user._id;
            // console.log(userId)
            // console.log(user)
        const addressDocument = await Address.findOne({ userId: userId });

        if (!addressDocument || !addressDocument.addresses || addressDocument.addresses.length === 0) {
            // No addresses found, render a message
            return res.render('user/address', {
                user: req.session,
                addresses: [],
                message: "No addresses found. Please add an address.",
                addAddressLink: "/addAddress" // Provide a link to add a new address
            });
        }

        res.render('user/address', {
            user: req.session.user,
            addresses: addressDocument.addresses
        });
        }
        catch (err) {
            next(err)
        }
    },

    //add new address
    addaddress: async (req,res,next) => {
        try{
            res.render('user/addAddress',{
                title: 'My Address',
                user: req.session
            })
        }
        catch(err){
            next(err)
        }
    },

    //add address post
    postaddaddress: async (req,res,next)=>{
        try{
            const userId = req.session.userID || req.user._id;
            
            let userAddress = await Address.findOne({ userId: userId });

            if (!userAddress) {
                userAddress = new Address({
                    userId: userId,
                    addresses: [{
                        buildingname: req.body.buildingname,
                        pincode: req.body.pincode,
                        city: req.body.city,
                        state: req.body.state,
                        street: req.body.street,
                        country: req.body.country
                    }]
                });
            } else {

                userAddress.addresses.push({
                    buildingname: req.body.buildingname,
                    pincode: req.body.pincode,
                    city: req.body.city,
                    street: req.body.street,
                    state: req.body.state,
                    country: req.body.country
                });
            }

            await userAddress.save();

            res.status(200).render('user/address',{
                message:'Address added successfully',
                user: req.session.user,
                addresses: userAddress.addresses
            })
                
            }   
            catch(err){
                next(err)
            }
        },

        //delete address 
        deleteAddress : async (req, res, next) => {
            try {
                const addressid = req.params.id;
                const userid = req.session.user._id;

               
                
           await Address.findOneAndUpdate(
                { userId: userid },
                { $pull: { addresses: { _id: addressid } } },
                { new: true }
            )

            return res.status(200).json({ success: true, message: "Removed successfully" });

           
            }
            catch (error) {
                next(error)
            }
        },

    // Edit Address    
    getEditAddress: async (req,res, next) => {
        try{

            const userid = req.session.user._id;
            const addressId = req.params.id;
            const user = req.session.user;

            const userAddress = await Address.findOne({userId : userid})

            const address = userAddress.addresses.find(
                (addr) => addr._id.toString() === addressId
            )

            res.render('user/editAddress', {
                address: address,
                user: user
               

            })

        }
            catch(error){
        next(error)
        }
    },


    postEditAddress: async (req, res, next) => {
        try {

            const addressId = req.params.id;
            const userId = req.session.user._id;
            const user =  req.session.user

            const userAddress = await Address.findOneAndUpdate({userId : userId})

          

            const address = userAddress.addresses.find (
                (address) => address._id.toString() === addressId
            )
            

            address.buildingname = req.body.buildingname,
            address.pincode = req.body.pincode,
            address.city = req.body.city,
            address.street = req.body.street,
            address.state = req.body.state,
            address.country = req.body.country

            await userAddress.save()

            res.redirect('/user/address')


        }
        catch(error) {
            next(error)
        }
    },

}

module.exports = addressController;