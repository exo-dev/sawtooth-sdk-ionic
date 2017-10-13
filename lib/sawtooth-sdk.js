'use strict';

const protobuf = require('protobufjs');
const root = protobuf.Root.fromJSON(require('./protobuf_bundle.json'));
const Wallet = require('./wallet');
const TransactionHeader = root.lookup('TransactionHeader');
const Transaction = root.lookup('Transaction');
const BatchHeader = root.lookup('BatchHeader');
const Batch = root.lookup('Batch');
const BatchList = root.lookup('BatchList');
// const Buffer = require('buffer/').Buffer;
const jsonDescriptor = require('./protobuf.config.json');

const cryptoJS = require('crypto-js');
function initProtobuf(jsonNamespace) {
    const tmpRoot = protobuf.Root.fromJSON(jsonDescriptor);
    return tmpRoot.lookupType(jsonNamespace);
}

module.exports = class SawtoothSdk {
    constructor(config) {
        this.mainAddress = config.mainAddress;

        this.batcherPubkey =  this.batcherPubkey;
        this.familyName = config.familyName;
        this.familyVersion =  config.familyVersion;
        this.inputs = config.inputs;
        this.outputs = this.outputs;
        this.payloadEncoding =  config.payloadEncoding || 'application/protobuf';
        this.signerPubkey = config.signerPubkey;
        this.payloadEncoder = config.payloadEncoder;
        if(config.privateKey) {
            this.wallet = this.generateWallet(config.privateKey);
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
    generateWallet(privateKey) {
        const wallet = new Wallet(privateKey);
        return wallet;
    }
    parseTransactionConfig(config) {
        return {
            batcherPubkey: config.batcherPubkey || this.batcherPubkey || this.wallet.getPublic(),
            dependencies: config.dependencies || [],
            familyName: config.familyName || this.familyName,
            familyVersion: config.familyVersion || this.familyVersion,
            inputs: config.inputs || this.inputs,
            outputs: config.outputs || this.outputs,
            nonce: config.nonce || this.generateNonce(),
            payloadEncoding: config.payloadEncoding || 'application/protobuf',
            signerPubkey: config.publicKey || this.wallet.getPublic(),
            payloadEncoder: config.transactionEncoder || this.transactionEncoder
        };
    }

    generateWalletBatchBytes(adminAddress, payload, config) {
        const privateKey = config.privateKey || this.wallet.getPrivate();
        const wallet = this.generateWallet(privateKey);
        const encodedPayload = this.transactionEncoder(payload);
        const parsedConfig = this.parseTransactionConfig(config);
        parsedConfig.payloadSha512 =  this.hash(encodedPayload);
        const header = TransactionHeader.encode(parsedConfig).finish();
        const signedHeader = wallet.sign(header);
        const transactions = [Transaction.create({
            header,
            headerSignature: signedHeader,
            payload: encodedPayload
        })];

        const headerBatch = BatchHeader.encode({
            signerPubkey: wallet.getPublic(),
            transactionIds: transactions.map((t) => t.headerSignature)
        }).finish();

        let batches = [Batch.create({
            header: headerBatch,
            headerSignature: wallet.sign(headerBatch),
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

    encode(payload, jsonNamespace) {
        const protobufRoot = initProtobuf(jsonNamespace);
        return protobufRoot.encode(payload).finish();
    }

    decode(encodePayload, jsonNamespace) {
        const protobufRoot = initProtobuf(jsonNamespace);
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
};
