const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const validator = require("validator");

const User = require("../model/users");
const { operationalError } = require("../services/errorHandling");
const { respondSuccess } = require("../services/response");

module.exports = {
    async getUsers (req, res, next) {
        const users = await User.find({});
        respondSuccess(res, 200, users);
    },

    async getProfile (req, res, next) {
        respondSuccess(res, 200, req.authenticatedUser.info);
    },

    async signUp (req, res, next) {
        if (req.body.password === undefined) {
            throw operationalError(400, "密碼未填寫");
        }
        if (typeof req.body.password !== "string") {
            throw new TypeError("密碼必須是字串");
        }

        let errorMsg = validatePassword(req.body.password);
        if (errorMsg) {
            throw operationalError(400, errorMsg);
        }

        //
        const passwordHash = await generatePasswordHash(req.body.password);
        delete req.body.password;

        //
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const newUser = (
                await User.create([{ ...req.body, passwordHash }], { session })
            )[0];
            
            // generate JWT token
            const token = jwt.sign(
                { id: newUser._id }, 
                process.env.JWT_SECRET, 
                { expiresIn: process.env.JWT_EXPIRE_TIME }
            );

            //
            await session.commitTransaction();
            session.endSession();

            //
            respondSuccess(res, 201, {
                nickname: newUser.nickname,
                token
            });
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    },

    async signIn (req, res, next) {
        if (!req.body.email) {
            throw operationalError(400, "Email 未填寫");
        }
        if (!req.body.password) {
            throw operationalError(400, "密碼未填寫");
        }

        // get password hash from DB
        const user = await User.findOne({ email: req.body.email }).select(
            "+passwordHash"
        );
        if (user === null) {
            throw operationalError(400, "帳號或密碼錯誤");
        }

        // compare password
        let ok = await bcrypt.compare(req.body.password, user.passwordHash);
        if (!ok) {
            throw operationalError(400, "帳號或密碼錯誤");
        }

        // generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE_TIME,
        });

        //
        respondSuccess(res, 200, {
            nickname: user.nickname,
            token
        });
    },

    async updatePassword (req, res, next) {
        if (req.body.password === undefined) {
            throw operationalError(400, "密碼未填寫");
        }
        if (typeof req.body.password !== "string") {
            throw new TypeError("密碼必須是字串");
        }

        let errorMsg = validatePassword(req.body.password);
        if (errorMsg) {
            throw operationalError(400, errorMsg);
        }

        //
        const passwordHash = await generatePasswordHash(req.body.password);
        delete req.body.password;

        // generate JWT token
        const token = jwt.sign(
            { id: req.authenticatedUser.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRE_TIME }
        );

        //
        const updatedUser = await User.findByIdAndUpdate(
            req.authenticatedUser.id,
            { passwordHash },
            { new: true, runValidators: true }
        );
        if (updatedUser === null) {
            throw operationalError(400, "user 不存在");
        }

        //
        respondSuccess(res, 200, { 
            nickname: req.authenticatedUser.info.nickname,
            token 
        });
    },

    async updateProfile (req, res, next) {
        const { nickname, photo, gender } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.authenticatedUser.id,
            { nickname, photo, gender }, 
            { new: true, runValidators: true }
        ).select('nickname photo gender -_id');

        if (updatedUser === null) {
            throw operationalError(400, "user 不存在");
        }

        respondSuccess(res, 200, updatedUser);
    },

    async follow (req, res, next) {
        const targetUserId = req.params.id;

        if (targetUserId === req.authenticatedUser.id) {
            throw operationalError(400, '無法追蹤自己');
        }

        const targetUser = await User.findById(targetUserId);
        if (targetUser === null) {
            throw operationalError(400, '查無欲追蹤的使用者');
        }

        //
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // add to source user's `following` list
            await User.updateOne(
                {
                    _id: req.authenticatedUser.id,
                    'following.user': { $ne: targetUserId }
                },
                {
                    $push: {
                        following: { user: targetUserId }
                    }
                },
                { session }
            );

            // add to target user's `followers` list
            await User.updateOne(
                {
                    _id: targetUserId,
                    'followers.user': { $ne: req.authenticatedUser.id }
                },
                {
                    $push: {
                        followers: { user: req.authenticatedUser.id }
                    }
                },
                { session }
            );

            //
            await session.commitTransaction();
            session.endSession();

            respondSuccess(res, 200);
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    },

    async unfollow (req, res, next) {
        const targetUserId = req.params.id;

        if (targetUserId === req.authenticatedUser.id) {
            throw operationalError(400, '無法取消追蹤自己');
        }

        

    },
};

//

/**
 * @param {String} password
 * @return error message for user (empty if no error)
 */
function validatePassword(password) {
    const passwordMinLength = 8;

    if (!validator.isAscii(password)) {
        return "密碼格式錯誤";
    }
    if (!validator.isLength(password, { min: passwordMinLength })) {
        return `密碼至少需 ${passwordMinLength} 個字元`;
    }
    if (!/\d/.test(password)) {
        return "密碼需英數混和";
    }
    if (!/[a-zA-Z]/.test(password)) {
        return "密碼需英數混和";
    }

    return "";
}

async function generatePasswordHash(password) {
    const saltLength = 12;
    return await bcrypt.hash(password, saltLength);
}
