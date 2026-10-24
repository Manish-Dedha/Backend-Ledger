const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const { default: mongoose } = require("mongoose")

/**
 * The 10 transaction flow
 * 1.Validate request
 * 2.Validate idempotency key
 * 3.Check account status
 * 4.Derive sender balance from ledger
 * 5.Create transaction
 * 6.Create debit ledger entry
 * 7.Create credit ledger entry
 * 8.Mark transaction as completed
 * 9.Commit mongoDB session
 * 10.Send email notification
 */
async function createTransaction(req,res){

    //1. Validate request

    const {fromAccount,toAccount,amount,idempotencyKey} = req.body

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message : "Missing required fields"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id : fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id : toAccount,
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(404).json({
            message : "Account not found"
        })
    }

    //2. Validate idempotency key

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey : idempotencyKey
    })

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "pending"){
            res.status(500).json({
                message : "Transaction is still in pending"
            })
        }
        if(isTransactionAlreadyExists.status === "completed"){
            res.status(500).json({
                message : "Transaction is already completed"
            })
        }
        if(isTransactionAlreadyExists.status === "failed"){
            res.status(500).json({
                message : "Transaction is failed. Try again"
            })
        }
    }

    //3. Check account status
    if(fromUserAccount.status!= 'Active' || toUserAccount.status!= 'Active'){
        return res.status(500).json({
            message : "Both formAccount and userAccount must be active"
        })
    }

    //4. Derive sender balance from ledger

    const balanceData = await fromUserAccount.getBalance()

    if(balanceData < amount){
        return res.status(400).json({
            message : `Insufficient balance in your account.Current balance is ${balanceData} and requested balance is ${amount}`
        })
    }

    //5. Create transaction
    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status : 'pending'
    })

    //6.Create debit ledger entry
    const debitLedgerEntry = await ledgerModel.create([{
        account:fromAccount,
        amount:amount,
        transaction : transaction._id,
        type : 'Debit'
    }],{session})

    await (()=>{
        return new Promise((resolve) = setTimeout(resolve,15 *1000));
    })

    //7.Create create ledger entry
    const creditLedgerEntry = await ledgerModel.create([{
        account : toAccount,
        amount : amount,
        transaction : transaction._id,
        type : 'Credit'
    }],{session})



    //8.Mark transaction as completed
    await transactionModel.findOneAndUpdate(
        {_id:transaction._id},
        {status:"completed"},
        {session}
    )

    //9.Commit mongoDB session
    await session.commitTransaction()
    session.endSession()

    //10.Send email notification
    await emailService.sendTransactionEmail(req.user.email,req.user.name,amount.transactionType)
        return res.status(400).json({
            message : "Transaction completed sussesfully",
            transaction:transaction
        })
}

async function createSystemInitialFundTransaction(req,res){
    const {toAccount,amount,idempotencyKey} = req.body

    if(!toAccount || !amount ||!idempotencyKey){
        return res.status(400).json({
            message: "toAccount and account and idempotency key is required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id : toAccount
    })

    const fromUserAccount = await accountModel.findOne({
        user : req.user._id
    })

    if(!toUserAccount){
        return res.status(400).json({
            message : "Invalid toAccount"
        })
    }
    if(!fromUserAccount){
        return res.status(400).json({
            message : "System account is not found"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount : fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status : "pending"
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account : fromUserAccount._id,
        amount : amount,
        transaction : transaction._id,
        type : "Debit"
    }],{session})

    const creditLedgerEntry = await ledgerModel.create([{
        account : toUserAccount._id,
        amount : amount,
        transaction : transaction._id,
        type : "Credit"
    }],{session})

    transaction.status = "completed"
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    return res.status(200).json({
        message : "Initial fund transaction completed successfully",
        transaction : transaction
    })
}


module.exports = {
    createTransaction,
    createSystemInitialFundTransaction
}