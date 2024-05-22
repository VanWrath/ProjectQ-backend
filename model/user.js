var mongoose = require('mongoose')
var Schema = mongoose.Schema

var user = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    joinDate: {type: Date, default: Date.now},
    journal: [
        {
            date: Date,
            question: String,
            answer: String
        }
    ]
})

module.exports = mongoose.model('User', user);