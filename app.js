const express  = require('express');
const mongoose = require('mongoose');   
const cors     = require('cors');
const getData  = require('./controller/getData');

const app      = express();
const PORT     = process.env.PORT || 3000;


app.use('/api', getData) ;

mongoose.connect('mongodb://localhost:27017/your_database_name')
.then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Export the app for testing purposes