'use strict';
var KeyGenerator = require('./key-generator');
module.exports = /** @class */ (function () {
    function Credentials(privateKey) {
        this.keyGenerator = new KeyGenerator(privateKey);
        this.keys = {
            privateKey: this.keyGenerator.getPrivate(),
            publicKey: this.keyGenerator.getPublic()
        };
    }
    Credentials.prototype.getPublic = function () {
        return this.keys.publicKey;
    };
    Credentials.prototype.getPrivate = function () {
        return this.keys.privateKey;
    };
    Credentials.prototype.sign = function (data, privateKey) {
        var privKey = privateKey || this.getPrivate();
        return this.keyGenerator.sign(data, privKey);
    };
    return Credentials;
}());
