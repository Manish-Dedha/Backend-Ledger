const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/tokenBlacklist.model")

async function authMiddleware(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]

    if(!token){
        return res.status(409).json({
            message : "Unauthorized Access, Token is missing "
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({token})

    if(isTokenBlacklisted){
        return res.status(401).json({
            message : "Unauthorized Access, Token is blacklisted"
        })
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)

        const user = await userModel.findById(decoded.userId)

        req.user = user

        return next()

    } catch (error) {
        res.status(401).json({
            message : "Unauthorized Access"
        })
    }
}

async function systemUserMiddleware(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]

    if(!token){
        res.status(401).json({
            message : "Unauthorized access , Token is missing"
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({token})

    if(isTokenBlacklisted){
        return res.status(401).json({
            message : "Unauthorized Access, Token is blacklisted"
        })
    }

    try{
        const decode = jwt.verify(token,process.env.JWT_SECRET_KEY)

        const user = await userModel.findById(decode.userId).select("+systemUser")

        if(!user){
            req.status(403).json({
                message : "User not found"
            })
        }

        req.user = user

        return next()
    }catch (err){
        req.status(401).json({
            message: "Unauthorized access"
        })
    }
}

module.exports = {
    authMiddleware,
    systemUserMiddleware
}