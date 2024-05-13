var express = require('express');
const cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');
const { invalidRouteHandler, errorHandler } = require('./middlewares')

dotenv.config();
 
// MongoDB
const connectString = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD ??= ''
);
mongoose.connect(connectString).then(() => {
    console.log('connected to DB');
})

//
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use(invalidRouteHandler);

app.use(errorHandler);

module.exports = app;
