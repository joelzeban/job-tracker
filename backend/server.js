const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app =express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',require('./routes/authRoutes'));
app.use('/api/jobs',require('./routes/jobRoutes'));

mongoose.connect(process.env.MONGO_URI)
   .then(()=> {
    app.listen(process.env.PORT || 5000, () =>
    console.log('Server running port 5000'));
   })
   .catch(err => console.log(err));