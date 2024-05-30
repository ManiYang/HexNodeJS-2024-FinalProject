const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const User = require('../model/users');
const { operationalError } = require('../services/errorHandling');
const { respondSuccess } = require('../services/response');

module.exports = {
    getUsers: async (req, res, next) => {
        const users = await User.find({});
        respondSuccess(res, 200, users);
    },

    getUser: async (req, res, next) => {
        const user = await User.findById(req.params.id);
        if (user === null) {
            throw operationalError(400, 'user 不存在');
        }
        respondSuccess(res, 200, user);
    },

    signUp: async (req, res, next) => {
        if (req.body.password === undefined)
            throw operationalError(400, '密碼未填寫');

        const passwordMinLength = 8;
        if (!validator.isLength(req.body.password, { min: passwordMinLength })) {
            throw operationalError(400, `密碼至少需 ${passwordMinLength} 個字元`);
        }

        // generate password hash
        const saltLength = 12;
        const passwordHash = await bcrypt.hash(req.body.password, saltLength);
        delete req.body.password;

        //
        const newUser = await User.create({ ...req.body, passwordHash });

        // generate JWT token
        token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE_TIME }
        );

        respondSuccess(res, 201, {
            nickname: newUser.nickname,
            photo: newUser.photo,
            token
        });
    },

    signIn: async (req, res, next) => {
        if (!req.body.email) {
            throw operationalError(400, 'Email 未填寫');
        }
        if (!req.body.password) {
            throw operationalError(400, '密碼未填寫');
        }

        // get password hash from DB



        
        // compare




    },

    updateUser: async (req, res, next) => {
        if (req.body.email !== undefined) {
            throw operationalError(400, 'email 不可更改');
        }
        if (req.body.createdAt !== undefined) {
            throw operationalError(400, 'createdAt 不可更改');
        }
    
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (updatedUser === null) {
            throw operationalError(400, 'user 不存在');
        }
    
        respondSuccess(res, 200, updatedUser);
    },

};
