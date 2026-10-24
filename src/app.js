const express = require('express')
const authRouter = require("../src/router/auth.router")
const accountRouter = require("../src/router/account.router")
const transactionRouter = require("../src/router/transaction.router")
const cookieParser = require("cookie-parser")
const multer = require("multer")

const app = express();
app.use(express.json());
app.use(cookieParser());

const upload = multer({storage:multer.memoryStorage()})

app.get("/",(req,res)=>{
    res.send("Leder service is up and running")
})

app.use("/api/auth",authRouter)
app.use("/api/account",accountRouter)
app.use("/api/transaction",transactionRouter)


module.exports = app