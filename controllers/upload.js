const path = require('path')
import { v4 as uuidv4 } from 'uuid';

const firebaseAdmin = require('../services/firebase');
const { operationalError } = require('../services/errorHandling');
const { respondSuccess } = require('../services/response');

const bucket = firebaseAdmin.storage().bucket();

module.exports = {
    async uploadImage (req, res, next) {
        if (req.user === undefined) {
            throw new Error('`user` property not found');
        }
        if (req.files === undefined) {
            throw new Error('`files` property not found');
        }

        if (req.files.length === 0) {
            throw operationalError(400, '未指定要上傳的檔案');
        }
        if (req.files.length > 1) {
            throw operationalError(400, '僅限上傳一個檔案');
        }

        const file = req.files[0];
        const ext = path.extname(file.originalname);
        const blob = bucket.file(`images/${uuidv4()}.${ext}`);

        const blobStream = blob.createWriteStream();

        blobStream.on('finish', () => {
            const config = {
                action: 'read', // 權限
                expires: '12-31-2500', // 網址的有效期限
            };
            blob.getSignedUrl(config, (err, fileUrl) => {
                respondSuccess(res, 200, fileUrl);
            });
        });

        blobStream.on('error', (err) => {
            throw operationalError(400, "上傳失敗");
        });

        blobStream.end(file.buffer);
    },
}
