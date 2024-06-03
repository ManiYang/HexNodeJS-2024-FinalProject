const express = require('express');
const cors = require('cors')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');
const userRouter = require('./routes/user');
const usersRouter = require('./routes/users');
const uploadRouter = require('./routes/upload');
const { invalidRouteHandler, errorHandler } = require('./middlewares')

process.on('uncaughtException', (err) => {
    console.error('[Uncaught Exception]');
    console.error(err);
    console.error(err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[Unhandled Rejection]');
    console.error(promise);
    console.error(reason);
});

//
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
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

app.use('/post', postRouter);
app.use('/posts', postsRouter);
app.use('/user', userRouter);
app.use('/users', usersRouter);
app.use('/upload', uploadRouter);
app.use(invalidRouteHandler);

app.use(errorHandler);

module.exports = app;
