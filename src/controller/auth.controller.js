const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")
const tokenBlacklistModel = require("../models/tokenBlacklist.model")

async function registerUser(req,res) { 
    const {email,name,password} = req.body

    const isAlreadyRegisterUser = await userModel.findOne({
        email : email,
    })

    if(isAlreadyRegisterUser){
        res.status(422).json({
            message : "User is already register",
            status : "Failed"
        })
    }
    
    const user = await userModel.create({
        email,
        name,
        password
    })

    const token = jwt.sign({
        userId:user._id,
    },process.env.JWT_SECRET_KEY)

    res.cookie("token",token)

    res.status(201).json({
        message:"User register successfully",
        user :{
            _id:user._id,
            email:user.email,
            name: user.name
        },
        token
    })  
    
    await emailService.sendRegistrationEmail(user.email,user.name)


}

async function loginUser(req,res) {
    const{email,password} = req.body

    const user = await userModel.findOne({email}).select("+password")

    if(!user){
        res.status(401).json({
            message : "User not found",
        })
    }

    const validPassword = await user.compare(password)

    if(!validPassword){
        res.status(401).json({
            message : "Email or password is invalid",
        })
    }

    const token = jwt.sign({
        userId:user._id,
    },process.env.JWT_SECRET_KEY)

    res.cookie("token",token)

    res.status(201).json({
        message:"User login successfully",
        user :{
            _id:user._id,
            email:user.email,
            name: user.name
        },
        token
    })
}

async function  logoutUser(req,res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]

    if(!token){
        return res.status(409).json({
            message : "Unauthorized Access, Token is missing "
        })
    }

    await tokenBlacklistModel.create({
        token : token
    })

    res.clearCookie("token")

    res.status(200).json({
        message : "User logout successfully"
    })
}

module.exports = {registerUser,loginUser,logoutUser}