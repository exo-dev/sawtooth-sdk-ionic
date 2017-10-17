'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KeyGenerator = require('./key-generator');
module.exports = function () {
    function Credentials(privateKey) {
        _classCallCheck(this, Credentials);

        this.keyGenerator = new KeyGenerator(privateKey);
        this.keys = {
            privateKey: this.keyGenerator.getPrivate(),
            publicKey: this.keyGenerator.getPublic()
        };
    }

    _createClass(Credentials, [{
        key: 'getPublic',
        value: function getPublic() {
            return this.keys.publicKey;
        }
    }, {
        key: 'getPrivate',
        value: function getPrivate() {
            return this.keys.privateKey;
        }
    }, {
        key: 'sign',
        value: function sign(data, privateKey) {
            var privKey = privateKey || this.getPrivate();
            return this.keyGenerator.sign(data, privKey);
        }
    }]);

    return Credentials;
}();