'use strict';
const KeyGenerator = require('./key-generator');
module.exports = class Credentials {
    constructor(privateKey) {
        this.keyGenerator = new KeyGenerator(privateKey);
        this.keys = {
            privateKey: this.keyGenerator.getPrivate(),
            publicKey: this.keyGenerator.getPublic()
        };
    }

    getPublic() {
        return this.keys.publicKey;
    }

    getPrivate() {
        return this.keys.privateKey;
    }

    sign(data, privateKey) {
        const privKey = privateKey || this.getPrivate();
        return this.keyGenerator.sign(data, privKey);
    }
};
