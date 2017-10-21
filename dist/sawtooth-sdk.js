"use strict";
exports.__esModule = true;
var protobuf = require('protobufjs');
var root = protobuf.Root.fromJSON(require('./protobuf_bundle.json'));
var credentials_1 = require("./credentials");
var TransactionHeader = root.lookup('TransactionHeader');
var Transaction = root.lookup('Transaction');
var BatchHeader = root.lookup('BatchHeader');
var Batch = root.lookup('Batch');
var BatchList = root.lookup('BatchList');
var Buffer = require('buffer/').Buffer;
var jsonDescriptor = require('./protobuf.config.json');
var cryptoJS = require('crypto-js');
var SawtoothSdk = /** @class */ (function () {
    function SawtoothSdk(config) {
        if (typeof config !== 'undefined' && config !== null) {
            this.mainAddress = config.mainAddress;
            this.batcherPubkey = config.batcherPubkey;
            this.familyName = config.familyName;
            this.familyVersion = config.familyVersion;
            this.inputs = config.inputs;
            this.outputs = config.outputs;
            this.payloadEncoding = config.payloadEncoding || 'application/protobuf';
            this.signerPubkey = config.signerPubkey;
            this.payloadEncoder = config.payloadEncoder;
            this.jsonDescriptor = config.jsonDescriptor || jsonDescriptor;
            if (config.privateKey) {
                this.credentials = this.generateCredentials(config.privateKey);
            }
        }
    }
    SawtoothSdk.prototype.hash = function (data) {
        var wordList;
        if (typeof data === 'string') {
            wordList = data;
        }
        else {
            wordList = cryptoJS.lib.WordArray.create(data);
        }
        return cryptoJS.SHA512(wordList).toString(cryptoJS.enc.HEX);
    };
    SawtoothSdk.prototype.generateCredentials = function (privateKey) {
        return new credentials_1["default"](privateKey);
    };
    SawtoothSdk.prototype.parseTransactionConfig = function (config) {
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
    };
    SawtoothSdk.prototype.generateTransactionBatchBytes = function (payload, config) {
        var privateKey = config.privateKey || this.credentials.getPrivate();
        var credentials = this.generateCredentials(privateKey);
        var encodedPayload = this.transactionEncoder(payload);
        var parsedConfig = this.parseTransactionConfig(config);
        parsedConfig.payloadSha512 = this.hash(encodedPayload);
        var header = TransactionHeader.encode(parsedConfig).finish();
        var signedHeader = credentials.sign(header);
        var transactions = [Transaction.create({
                header: header,
                headerSignature: signedHeader,
                payload: encodedPayload
            })];
        var headerBatch = BatchHeader.encode({
            signerPubkey: credentials.getPublic(),
            transactionIds: transactions.map(function (t) { return t.headerSignature; })
        }).finish();
        var batches = [Batch.create({
                header: headerBatch,
                headerSignature: credentials.sign(headerBatch),
                transactions: transactions
            })];
        var encodeBatch = BatchList.encode({ batches: batches }).finish();
        return Buffer.from(encodeBatch).toString('base64');
    };
    SawtoothSdk.prototype.generateNonce = function () {
        var dateString = Date.now().toString(36).slice(-5);
        var randomString = Math.floor(Math.random() * 46655).toString(36);
        return dateString + ('00' + randomString).slice(-3);
    };
    SawtoothSdk.prototype.initProtobuf = function (jsonNamespace) {
        var tmpRoot = protobuf.Root.fromJSON(this.jsonDescriptor);
        return tmpRoot.lookupType(jsonNamespace);
    };
    SawtoothSdk.prototype.encode = function (payload, jsonNamespace) {
        var protobufRoot = this.initProtobuf(jsonNamespace);
        return protobufRoot.encode(payload).finish();
    };
    SawtoothSdk.prototype.decode = function (encodePayload, jsonNamespace) {
        var protobufRoot = this.initProtobuf(jsonNamespace);
        return protobufRoot.decode(encodePayload);
    };
    SawtoothSdk.prototype.transactionEncoder = function (data) {
        return this.encode(data, 'TransactionPayload');
    };
    SawtoothSdk.prototype.transactionDecoder = function (data) {
        return this.decode(data, 'TransactionPayload');
    };
    return SawtoothSdk;
}());
exports["default"] = SawtoothSdk;
module.exports = SawtoothSdk;
