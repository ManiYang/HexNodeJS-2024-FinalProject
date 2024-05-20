const express = require('express');
const cors = require('cors')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');
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

app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use(invalidRouteHandler);

app.use(errorHandler);

module.exports = app;
