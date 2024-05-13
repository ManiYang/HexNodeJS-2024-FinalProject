const User = require('../model/users');
const { operationalError } = require('../services/errorHandling');

module.exports = {
    getUsers: async (req, res, next) => {
        const users = await User.find({});
        res.status(200).json({
            status: 'success',
            data: users
        });
    },

    getUser: async (req, res, next) => {
        const user = await User.findById(req.params.id);
        if (user === null) {
            throw operationalError(400, 'user 不存在');
        }

        res.status(200).json({
            status: 'success',
            data: user
        });
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
            throw operationalError(400, 'email 不可更改');
        }
        if (req.body.createAt !== undefined) {
            throw operationalError(400, 'createAt 不可更改');
        }
    
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (updatedUser === null) {
            throw operationalError(400, 'user 不存在');
        }
    
        res.status(200).json({
            status: 'success',
            data: updatedUser
        });
    },

};
