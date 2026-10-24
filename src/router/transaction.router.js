const {Router} = require("express");
const authMiddleware = require("../middleware/auth.middleware")
const transactionController = require("../controller/transaction.controller")


const transactionRouter = Router();

transactionRouter.post("/",authMiddleware.authMiddleware,transactionController.createTransaction)

transactionRouter.post("/system/initial-fund",authMiddleware.systemUserMiddleware,transactionController.createSystemInitialFundTransaction)


module.exports = transactionRouter;

