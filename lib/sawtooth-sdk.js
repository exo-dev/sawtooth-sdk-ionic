'use strict';
const protobuf = require('protobufjs');
const root = protobuf.Root.fromJSON(require('./protobuf_bundle.json'));
const Credentials = require('./credentials');
const TransactionHeader = root.lookup('TransactionHeader');
const Transaction = root.lookup('Transaction');
const BatchHeader = root.lookup('BatchHeader');
const Batch = root.lookup('Batch');
const BatchList = root.lookup('BatchList');
const Buffer = require('buffer/').Buffer;
const jsonDescriptor = require('./protobuf.config.json');
const cryptoJS = require('crypto-js');

class SawtoothSdk {
    constructor(config) {
        if(typeof config !== 'undefined' && config !== null) {
            this.mainAddress = config.mainAddress;
            this.batcherPubkey =  config.batcherPubkey;
            this.familyName = config.familyName;
            this.familyVersion =  config.familyVersion;
            this.inputs = config.inputs;
            this.outputs = this.outputs;
            this.payloadEncoding =  config.payloadEncoding || 'application/protobuf';
            this.signerPubkey = config.signerPubkey;
            this.payloadEncoder = config.payloadEncoder;
            if(config.privateKey) {
                this.credentials = this.generateCredentials(config.privateKey);
            }
        }
    }
    hash(data) {
        let wordList;
        if(typeof data === 'string') {
            wordList = data;
        }else{
            wordList = cryptoJS.lib.WordArray.create(data);
        }
        return cryptoJS.SHA512(wordList).toString(cryptoJS.enc.HEX);
    }
    generateCredentials(privateKey) {
        const credentials = new Credentials(privateKey);
        return credentials;
    }
    parseTransactionConfig(config) {
        return {
            batcherPubkey: config.batcherPubkey || this.batcherPubkey || this.credentials.getPublic(),
            dependencies: config.dependencies || [],
            familyName: config.familyName || this.familyName,
            familyVersion: config.familyVersion || this.familyVersion,
            inputs: config.inputs || this.inputs,
            outputs: config.outputs || this.outputs,
            nonce: config.nonce || this.generateNonce(),
            payloadEncoding: config.payloadEncoding || 'application/protobuf',
            signerPubkey: config.publicKey || this.credentials.getPublic(),
            payloadEncoder: config.transactionEncoder || this.transactionEncoder
        };
    }

    generateWalletBatchBytes(adminAddress, payload, config) {
        const privateKey = config.privateKey || this.credentials.getPrivate();
        const credentials = this.generateCredentials(privateKey);
        const encodedPayload = this.transactionEncoder(payload);
        const parsedConfig = this.parseTransactionConfig(config);
        parsedConfig.payloadSha512 =  this.hash(encodedPayload);
        const header = TransactionHeader.encode(parsedConfig).finish();
        const signedHeader = credentials.sign(header);
        const transactions = [Transaction.create({
            header,
            headerSignature: signedHeader,
            payload: encodedPayload
        })];

        const headerBatch = BatchHeader.encode({
            signerPubkey: credentials.getPublic(),
            transactionIds: transactions.map((t) => t.headerSignature)
        }).finish();

        let batches = [Batch.create({
            header: headerBatch,
            headerSignature: credentials.sign(headerBatch),
            transactions
        })];
        const encodeBatch = BatchList.encode({batches}).finish();

        return Buffer.from(encodeBatch).toString('base64');
    }

    generateNonce() {
        const dateString = Date.now().toString(36).slice(-5);
        const randomString = Math.floor(Math.random() * 46655).toString(36);
        return dateString + ('00' + randomString).slice(-3);
    }
    initProtobuf(jsonNamespace) {
        const tmpRoot = protobuf.Root.fromJSON(jsonDescriptor);
        return tmpRoot.lookupType(jsonNamespace);
    }
    encode(payload, jsonNamespace) {
        const protobufRoot = this.initProtobuf(jsonNamespace);
        return protobufRoot.encode(payload).finish();
    }

    decode(encodePayload, jsonNamespace) {
        const protobufRoot = this.initProtobuf(jsonNamespace);
        return protobufRoot.decode(encodePayload);
    }

    transactionEncoder(data) {
        return this.encode(data, 'TransactionPayload');
    }

    transactionDecoder(data) {
        return this.decode(data, 'TransactionPayload');
    }

    generateNonce() {
        const dateString = Date.now().toString(36).slice(-5);
        const randomString = Math.floor(Math.random() * 46655).toString(36);
        return dateString + ('00' + randomString).slice(-3);
    }
}
module.exports = SawtoothSdk;
