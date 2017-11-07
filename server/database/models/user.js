const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');

let User = Schema({
    "email": { type: String, required: true, unique: true },
    "password": { type: String },
    "nickname": { type: String, required: true, unique: true },
    "auth": { type: String, required: true },
    "asUser": [Schema.Types.ObjectId],
    "asAdmin": [Schema.Types.ObjectId]
}, {
        collection: "User"
    });


User.statics.create = function (email, password, nickname, _auth, _asUser, _asAdmin) {
    const secret = process.env.ENTRYDSM_SECRET || "DEFAULT SECRET KEY!";
    const auth = _auth || "local";
    const asUser = _asUser || [];
    const asAdmin = _asAdmin || [];

    const cipher = crypto.createCipher('aes192', secret);
    let encryptedEmail = cipher.update(email, 'utf8', 'hex');
    encryptedEmail += cipher.final('hex');


    const encryptedPassword = crypto.createHmac('sha1', secret)
        .update(password)
        .digest('base64');


    return new this({
        "email": encryptedEmail,
        "password": encryptedPassword,
        nickname,
        auth,
        asUser,
        asAdmin
    }).save();
}

User.statics.findOneByEmail = function (_email) {
    const secret = process.env.ENTRYDSM_SECRET || "DEFAULT SECRET KEY!";
    const cipher = crypto.createCipher('aes192', secret);
    let email = cipher.update(_email, 'utf8', 'hex');
    email += cipher.final('hex');
    return this.findOne({ email }).exec();
}

User.methods.verifyPassword = function (password) {
    const secret = process.env.ENTRYDSM_SECRET || "DEFAULT SECRET KEY!";
    
    const encryptedPassword = crypto.createHmac('sha1', secret)
        .update(password)
        .digest('base64');
    return this.password == encryptedPassword;
}
module.exports = mongoose.model('User', User);