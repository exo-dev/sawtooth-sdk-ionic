"use strict";
exports.__esModule = true;
var secp256k1 = require('secp256k1');
var cryptoJS = require('crypto-js');
var randomBytes = require('randombytes');
var Buffer = require('buffer/').Buffer;
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');
var KeyGenerator = /** @class */ (function () {
    function KeyGenerator(privateKey) {
        this.privateKey = this.parsePrivate(privateKey);
        this.keys = this.generateKeys(this.privateKey);
    }
    KeyGenerator.prototype.parsePrivate = function (privateKey) {
        var parsetPrivate = null;
        if (typeof privateKey === 'string') {
            parsetPrivate = new Buffer(privateKey, 'hex');
        }
        else if (privateKey instanceof Buffer) {
            parsetPrivate = privateKey;
        }
        return parsetPrivate;
    };
    KeyGenerator.prototype.generateKeys = function (privateKey) {
        var _this = this;
        var priv = this.parsePrivate(privateKey);
        var pub;
        if (priv !== null) {
            pub = this.getPublicFromPrivate(priv);
        }
        else {
            do {
                priv = randomBytes(32);
            } while (!secp256k1.privateKeyVerify(priv));
            pub = secp256k1.publicKeyCreate(priv);
        }
        return {
            priv: priv.toString('hex'),
            pub: pub.toString('hex'),
            sign: function (msg) {
                _this.sign(msg);
            }
        };
    };
    KeyGenerator.prototype.getPublic = function () {
        if (this.keys.pub) {
            return this.keys.pub;
        }
        return null;
    };
    KeyGenerator.prototype.getPrivate = function () {
        if (this.keys.priv) {
            return this.keys.priv;
        }
        return null;
    };
    KeyGenerator.prototype.getPublicFromPrivate = function (privKey) {
        var parsedPrivate = this.parsePrivate(privKey);
        if (parsedPrivate !== null) {
            return secp256k1.publicKeyCreate(parsedPrivate);
        }
        throw new Error('private key required. privateKey must be hexStr or Buffer.');
    };
    KeyGenerator.prototype.decodeBuffer = function (data, format) {
        if (data instanceof Buffer) {
            return data;
        }
        return Buffer.from(data, format);
    };
    KeyGenerator.prototype.hashData = function (data) {
        var dataBuffer = this.decodeBuffer(data, 'base64');
        var wordList = cryptoJS.lib.WordArray.create(dataBuffer);
        return Buffer.from(cryptoJS.SHA256(wordList).toString(cryptoJS.enc.HEX), 'hex');
    };
    KeyGenerator.prototype.decodeHex = function (hex) {
        return this.decodeBuffer(hex, 'hex');
    };
    KeyGenerator.prototype.sign = function (data, privateKey) {
        var dataHash = this.hashData(data);
        var result = ec.sign(dataHash, privateKey, { canonical: true });
        var signature = Buffer.concat([
            result.r.toArrayLike(Buffer, 'be', 32),
            result.s.toArrayLike(Buffer, 'be', 32)
        ]);
        return signature.toString('hex');
    };
    return KeyGenerator;
}());
exports["default"] = KeyGenerator;
