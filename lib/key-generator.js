const secp256k1 = require('secp256k1');
const cryptoJS = require('crypto-js');
const randomBytes = require('randombytes');
const Buffer = require('buffer/').Buffer;
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

export default class KeyGenerator {
    constructor(privateKey) {
        this.privateKey = this.parsePrivate(privateKey);
        this.keys = this.generateKeys(this.privateKey);
    }
    parsePrivate(privateKey) {
        let parsetPrivate = null;
        if(typeof privateKey === 'string') {
            parsetPrivate = new Buffer(privateKey, 'hex');
        }else if(privateKey instanceof Buffer) {
            parsetPrivate = privateKey;
        }
        return parsetPrivate;
    }
    generateKeys(privateKey) {
        let priv = this.parsePrivate(privateKey);
        let pub;
        if(priv !== null) {
            pub = this.getPublicFromPrivate(priv);
        }else{
            do {
                priv = randomBytes(32);
            } while (!secp256k1.privateKeyVerify(priv));
            pub = secp256k1.publicKeyCreate(priv);
        }
        return {
            priv:priv.toString('hex'),
            pub:pub.toString('hex'),
            sign:(msg) => {
                this.sign(msg);
            }
        };
    }
    getPublic() {
        if(this.keys.pub) {
            return this.keys.pub;
        }
        return null;
    }
    getPrivate() {
        if(this.keys.priv) {
            return this.keys.priv;
        }
        return null;
    }
    getPublicFromPrivate(privKey) {
        let parsedPrivate = this.parsePrivate(privKey);
        if(parsedPrivate !== null) {
            return secp256k1.publicKeyCreate(parsedPrivate);
        }
        throw new Error('private key required. privateKey must be hexStr or Buffer.');
    }
    decodeBuffer(data, format) {
        if(data instanceof Buffer) {
            return data;
        }
        return Buffer.from(data, format);
    }
    hashData(data) {
        const dataBuffer = this.decodeBuffer(data, 'base64');
        const wordList = cryptoJS.lib.WordArray.create(dataBuffer);
        return Buffer.from(cryptoJS.SHA256(wordList).toString(cryptoJS.enc.HEX), 'hex');
    }
    decodeHex(hex) {
        return this.decodeBuffer(hex, 'hex');
    }
    sign(data, privateKey) {
        const dataHash = this.hashData(data);
        const result = ec.sign(dataHash, privateKey, {canonical: true});
        const signature = Buffer.concat([
            result.r.toArrayLike(Buffer, 'be', 32),
            result.s.toArrayLike(Buffer, 'be', 32)
        ]);
        return signature.toString('hex');
    }
}
