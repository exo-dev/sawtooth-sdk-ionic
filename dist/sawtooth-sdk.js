'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var protobuf = require('protobufjs');
var root = protobuf.Root.fromJSON(require('./protobuf_bundle.json'));
var Credentials = require('./credentials');
var TransactionHeader = root.lookup('TransactionHeader');
var Transaction = root.lookup('Transaction');
var BatchHeader = root.lookup('BatchHeader');
var Batch = root.lookup('Batch');
var BatchList = root.lookup('BatchList');
var Buffer = require('buffer/').Buffer;
var jsonDescriptor = require('./protobuf.config.json');

var cryptoJS = require('crypto-js');
function initProtobuf(jsonNamespace) {
    var tmpRoot = protobuf.Root.fromJSON(jsonDescriptor);
    return tmpRoot.lookupType(jsonNamespace);
}

module.exports = function () {
    function SawtoothSdk(config) {
        _classCallCheck(this, SawtoothSdk);

        if (typeof config !== 'undefined' && config !== null) {
            this.mainAddress = config.mainAddress;
            this.batcherPubkey = config.batcherPubkey;
            this.familyName = config.familyName;
            this.familyVersion = config.familyVersion;
            this.inputs = config.inputs;
            this.outputs = this.outputs;
            this.payloadEncoding = config.payloadEncoding || 'application/protobuf';
            this.signerPubkey = config.signerPubkey;
            this.payloadEncoder = config.payloadEncoder;
            if (config.privateKey) {
                this.credentials = this.generateCredentials(config.privateKey);
            }
        }
    }

    _createClass(SawtoothSdk, [{
        key: 'hash',
        value: function hash(data) {
            var wordList = void 0;
            if (typeof data === 'string') {
                wordList = data;
            } else {
                wordList = cryptoJS.lib.WordArray.create(data);
            }
            return cryptoJS.SHA512(wordList).toString(cryptoJS.enc.HEX);
        }
    }, {
        key: 'generateCredentials',
        value: function generateCredentials(privateKey) {
            var credentials = new Credentials(privateKey);
            return credentials;
        }
    }, {
        key: 'parseTransactionConfig',
        value: function parseTransactionConfig(config) {
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
    }, {
        key: 'generateWalletBatchBytes',
        value: function generateWalletBatchBytes(adminAddress, payload, config) {
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
                transactionIds: transactions.map(function (t) {
                    return t.headerSignature;
                })
            }).finish();

            var batches = [Batch.create({
                header: headerBatch,
                headerSignature: credentials.sign(headerBatch),
                transactions: transactions
            })];
            var encodeBatch = BatchList.encode({ batches: batches }).finish();

            return Buffer.from(encodeBatch).toString('base64');
        }
    }, {
        key: 'generateNonce',
        value: function generateNonce() {
            var dateString = Date.now().toString(36).slice(-5);
            var randomString = Math.floor(Math.random() * 46655).toString(36);
            return dateString + ('00' + randomString).slice(-3);
        }
    }, {
        key: 'encode',
        value: function encode(payload, jsonNamespace) {
            var protobufRoot = initProtobuf(jsonNamespace);
            return protobufRoot.encode(payload).finish();
        }
    }, {
        key: 'decode',
        value: function decode(encodePayload, jsonNamespace) {
            var protobufRoot = initProtobuf(jsonNamespace);
            return protobufRoot.decode(encodePayload);
        }
    }, {
        key: 'transactionEncoder',
        value: function transactionEncoder(data) {
            return this.encode(data, 'TransactionPayload');
        }
    }, {
        key: 'transactionDecoder',
        value: function transactionDecoder(data) {
            return this.decode(data, 'TransactionPayload');
        }
    }, {
        key: 'generateNonce',
        value: function generateNonce() {
            var dateString = Date.now().toString(36).slice(-5);
            var randomString = Math.floor(Math.random() * 46655).toString(36);
            return dateString + ('00' + randomString).slice(-3);
        }
    }]);

    return SawtoothSdk;
}();