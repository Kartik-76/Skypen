const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notesSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    title:{
        type: String,
        require: true
    },
    description:{
        type: String,
        require: true,
        unique: true
    },
    tag:{
        type: String,
        default: "General"
    },
    date:{
        type: String,
        default: Date.now
    }
})

module.exports = mongoose.model('notes',notesSchema);