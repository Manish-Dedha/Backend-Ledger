const mongoose = require("mongoose")

async function connectDB(){
    await mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{
        console.log("Database is connected succesfully")
    })
    .catch(err =>{
        console.log("Error while connecting to the database")
        process.exit(1)
    })
    
}

module.exports = connectDB