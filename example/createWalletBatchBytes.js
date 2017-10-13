'use strict';
const SawtoothSdk = require('./lib/sawtooth-sdk');
const sdk = new SawtoothSdk({
    dependencies: [],
    familyVersion: '1.0',
    payloadEncoding: 'application/protobuf',
    privateKey: '65df52d50dc235f904872d0b7f14ac1517a267c9a9d49d928e9f3071db1b27bd'
});


const SAWTOOTH_PAYMENT_PROCESSOR_FAMILY = 'exoexample';
const EXO_SP_NAMESPACE = sdk.hash(SAWTOOTH_PAYMENT_PROCESSOR_FAMILY).substring(0, 6);
const fromAddress = EXO_SP_NAMESPACE + sdk.hash(sdk.credentials.getPublic()).slice(0, 64);

const payload = {
    public_key: sdk.credentials.getPublic(),
    type: 0
};
const batchBytesWallet = sdk.generateWalletBatchBytes(fromAddress, payload, {
    batcherPubkey: sdk.credentials.getPublic(),
    dependencies: [],
    familyName: SAWTOOTH_PAYMENT_PROCESSOR_FAMILY,
    familyVersion: '1.0',
    inputs: [EXO_SP_NAMESPACE],
    outputs: [EXO_SP_NAMESPACE],
    payloadEncoding: 'application/protobuf'
});

console.log('batchBytesWallet: ', batchBytesWallet);
