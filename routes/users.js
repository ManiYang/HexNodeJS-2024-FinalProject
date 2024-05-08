var express = require('express');
var router = express.Router();

const User = require('../model/users');

router.get('/', async (req, res, next) => {
    const users = await User.find({});
    res.status(200).json({
        status: 'success',
        data: users
    });
});
  
router.get('/:id', async (req, res, next) => {
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
});

router.post('/', async (req, res, next) => {
    try {
        const newUser = await User.create(req.body);
        res.status(200).json({
            status: 'success',
            data: newUser
        });
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        });
    }
});

// router.delete('/:id', async (req, res, next) => {
//     const result = await User.findByIdAndDelete(req.params.id);
//     if (result !== null) {
//         res.status(200).json({
//             status: 'success',
//             data: result
//         });
//     } else {
//         res.status(400).json({
//             status: 'failed',
//             message: '無此使用者'
//         });
//     }
// })

router.patch('/:id', async (req, res, next) => {
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

    try {
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
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        });
    }
});

module.exports = router;
