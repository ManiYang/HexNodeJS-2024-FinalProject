const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const User = require("../model/users");
const { operationalError } = require("../services/errorHandling");
const { respondSuccess } = require("../services/response");

module.exports = {
    getUsers: async (req, res, next) => {
        const users = await User.find({});
        respondSuccess(res, 200, users);
    },

    getProfile: async (req, res, next) => {
        if (req.userId === undefined) {
            throw new Error("userId not found");
        }

        const user = await User.findById(req.userId).select("-_id");
        if (user === null) {
            throw operationalError(400, "user 不存在");
        }

        respondSuccess(res, 200, user);
    },

    signUp: async (req, res, next) => {
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
        const newUser = await User.create({ ...req.body, passwordHash });

        // generate JWT token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE_TIME,
        });

        //
        respondSuccess(res, 201, {
            nickname: newUser.nickname,
            photo: newUser.photo,
            token,
        });
    },

    signIn: async (req, res, next) => {
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
            photo: user.photo,
            token,
        });
    },

    updatePassword: async (req, res, next) => {
        if (req.userId === undefined) {
            throw new Error("userId not found");
        }

        //
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
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { passwordHash },
            { new: true, runValidators: true }
        );
        if (updatedUser === null) {
            throw operationalError(400, "user 不存在");
        }

        // generate JWT token
        const token = jwt.sign(
            { id: req.userId }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRE_TIME });

        //
        respondSuccess(res, 200, { token });
    },

    updateProfile: async (req, res, next) => {
        if (req.userId === undefined) {
            throw new Error("userId not found");
        }

        const { nickname, photo, gender } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.userId, 
            { nickname, photo, gender }, 
            { new: true, runValidators: true }
        ).select('nickname photo gender -_id');

        if (updatedUser === null) {
            throw operationalError(400, "user 不存在");
        }

        respondSuccess(res, 200, updatedUser);
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
