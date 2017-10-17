'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var secp256k1 = require('secp256k1');
var cryptoJS = require('crypto-js');
var randomBytes = require('randombytes');
var Buffer = require('buffer/').Buffer;
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');

var KeyGenerator = function () {
    function KeyGenerator(privateKey) {
        _classCallCheck(this, KeyGenerator);

        this.privateKey = this.parsePrivate(privateKey);
        this.keys = this.generateKeys(this.privateKey);
    }

    _createClass(KeyGenerator, [{
        key: 'parsePrivate',
        value: function parsePrivate(privateKey) {
            var parsetPrivate = null;
            if (typeof privateKey === 'string') {
                parsetPrivate = new Buffer(privateKey, 'hex');
            } else if (privateKey instanceof Buffer) {
                parsetPrivate = privateKey;
            }
            return parsetPrivate;
        }
    }, {
        key: 'generateKeys',
        value: function generateKeys(privateKey) {
            var _this = this;

            var priv = this.parsePrivate(privateKey);
            var pub = void 0;
            if (priv !== null) {
                pub = this.getPublicFromPrivate(priv);
            } else {
                do {
                    priv = randomBytes(32);
                } while (!secp256k1.privateKeyVerify(priv));
                pub = secp256k1.publicKeyCreate(priv);
            }
            return {
                priv: priv.toString('hex'),
                pub: pub.toString('hex'),
                sign: function sign(msg) {
                    _this.sign(msg);
                }
            };
        }
    }, {
        key: 'getPublic',
        value: function getPublic() {
            if (this.keys.pub) {
                return this.keys.pub;
            }
            return null;
        }
    }, {
        key: 'getPrivate',
        value: function getPrivate() {
            if (this.keys.priv) {
                return this.keys.priv;
            }
            return null;
        }
    }, {
        key: 'getPublicFromPrivate',
        value: function getPublicFromPrivate(privKey) {
            var parsedPrivate = this.parsePrivate(privKey);
            if (parsedPrivate !== null) {
                return secp256k1.publicKeyCreate(parsedPrivate);
            }
            throw new Error('private key required. privateKey must be hexStr or Buffer.');
        }
    }, {
        key: 'decodeBuffer',
        value: function decodeBuffer(data, format) {
            if (data instanceof Buffer) {
                return data;
            }
            return Buffer.from(data, format);
        }
    }, {
        key: 'hashData',
        value: function hashData(data) {
            var dataBuffer = this.decodeBuffer(data, 'base64');
            var wordList = cryptoJS.lib.WordArray.create(dataBuffer);
            return Buffer.from(cryptoJS.SHA256(wordList).toString(cryptoJS.enc.HEX), 'hex');
        }
    }, {
        key: 'decodeHex',
        value: function decodeHex(hex) {
            return this.decodeBuffer(hex, 'hex');
        }
    }, {
        key: 'sign',
        value: function sign(data, privateKey) {
            var dataHash = this.hashData(data);
            var result = ec.sign(dataHash, privateKey, { canonical: true });
            var signature = Buffer.concat([result.r.toArrayLike(Buffer, 'be', 32), result.s.toArrayLike(Buffer, 'be', 32)]);
            return signature.toString('hex');
        }
    }]);

    return KeyGenerator;
}();

module.exports = KeyGenerator;