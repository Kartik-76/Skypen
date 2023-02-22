const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost:27017/skypen"

const connectToMongoo = () =>{
    mongoose.connect(mongoURI, ()=>{
        console.log("Connected Successfuly");
    })
}

module.exports = connectToMongoo;