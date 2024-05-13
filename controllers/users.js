const User = require('../model/users');

module.exports = {
    getUsers: async (req, res, next) => {
        const users = await User.find({});
        res.status(200).json({
            status: 'success',
            data: users
        });
    },

    getUser: async (req, res, next) => {
        const users = await User.findById(req.params.id);
        if (users !== null) {
            res.status(200).json({
                status: 'success',
                data: users
            });
        } else {
            res.status(400).json({
                status: 'failed',
                message: '無此使用者'
            });
        }
    },

    createUser: async (req, res, next) => {
        const newUser = await User.create(req.body);
        res.status(200).json({
            status: 'success',
            data: newUser
        });
    },

    updateUser: async (req, res, next) => {
        if (req.body.email !== undefined) {
            res.status(400).json({
                status: 'failed',
                message: 'email 不可更改'
            });
            return;
        }
        if (req.body.createAt !== undefined) {
            res.status(400).json({
                status: 'failed',
                message: 'createAt 不可更改'
            });
            return;
        }
    
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (updatedUser === null) {
            throw new Error('找不到該 user');
        }
    
        res.status(200).json({
            status: 'success',
            data: updatedUser
        });
    },

};
