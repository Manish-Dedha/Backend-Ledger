const accountModel = require("../models/account.model")

async function createAccountController(req,res){
    const user = req.user

    const account = await accountModel.create({
        user:user.id
    })

    res.status(201).json([
        account
    ])

}

async function getUserController(req,res){
    const account = await accountModel.find({user:req.user._id});

    res.status(200).json({
        account
    })

}

async function getAccountBalanceController(req,res) {
    const {accountID} = req.params

    const account = await accountModel.findOne({
        _id : accountID,
        user : req.user._id
    })

    if(!account){
        res.status(200).json({
            message : "Account not found"
        })
    }
    const balance = await account.getBalance();

    res.status(201).json({
            accountID : account._id,
            balance : balance
        })

}

module.exports = {
    createAccountController,
    getUserController,
    getAccountBalanceController
}