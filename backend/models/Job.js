const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String,required: true},
    role:  { type: String,required: true},
    status: {type: String,
             enum: ['Applied','Interview','Offer','Rejected'],
             default:'Applied'
    },
    location: String,
    salary: String,
    notes: String,
    appliedDate: {type: Date,default: Date.now},
    link: String
},{timestapms: true});

module.exports= mongoose.model('Job',jobSchema);