"use strict";
exports.__esModule = true;
var key_administrator_1 = require("./key-administrator");
var Credentials = /** @class */ (function () {
    function Credentials(privateKey) {
        this.keyAdministrator = new key_administrator_1["default"](privateKey);
        this.keys = {
            privateKey: this.keyAdministrator.getPrivate(),
            publicKey: this.keyAdministrator.getPublic()
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
        return this.keyAdministrator.sign(data, privKey);
    };
    return Credentials;
}());
exports["default"] = Credentials;
