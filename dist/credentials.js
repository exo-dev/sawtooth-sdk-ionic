"use strict";
exports.__esModule = true;
var key_generator_1 = require("./key-generator");
var Credentials = /** @class */ (function () {
    function Credentials(privateKey) {
        this.keyGenerator = new key_generator_1["default"](privateKey);
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
exports["default"] = Credentials;
