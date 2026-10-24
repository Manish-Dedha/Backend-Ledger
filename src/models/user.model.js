const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    email :{
        type : String,
        required : [true,"Email is required for crrating the user"],
        trim : true,
        lowercase : true,
        match : [/^\S+@\S+\.\S+$/   ,"Enter the correct email"],
        unique : true
    },
    name : {
        type : String,
        required : [true,"Name is required"],
    },
    password : {
        type : String,
        required : [true,"Password is required for creating the account"],
        minlength : [6,"Password should contain more then 6 character"],
        select :false,
    },
    systemUser : {
        type : Boolean,
        default : false,
        immutable : true,
        select : false
    }
},{
    timestamps : true
})
userSchema.pre("save",async function (){
    if(!this.isModified("password")){
        return
    }
    const hash = await bcrypt.hash(this.password,10)
    this.password = hash
    return
})

userSchema.methods.compare = async function (password) {
    return await bcrypt.compare(password,this.password)
}

const userModel = mongoose.model("user",userSchema)

module.exports = userModel