# sawtooth-sdk-ionic

[![Greenkeeper badge](https://badges.greenkeeper.io/exo-dev/sawtooth-sdk-ionic.svg)](https://greenkeeper.io/)

## usage:

```javascript
import * as SawtoothSdk from 'sawtooth-sdk-ionic';
```

### Create batchBytesWallet
```javascript
const sdk = new SawtoothSdk({
    dependencies: [],
    familyVersion: '1.0',
    payloadEncoding: 'application/protobuf',
    privateKey: '65da52d50dc235f904872d0b7f13bc1717a257c9a9d39d928d9f30e1db1b27bd'//optional
});


const SAWTOOTH_PAYMENT_PROCESSOR_FAMILY = 'exosexample';
const EXO_SP_NAMESPACE = sdk.hash(SAWTOOTH_PAYMENT_PROCESSOR_FAMILY).substring(0, 6);
const fromAddress = EXO_SP_NAMESPACE + sdk.hash(sdk.credentials.getPublic()).slice(0, 64);

const payload = {
    public_key: sdk.credentials.getPublic(),
    type: 0
};
const batchBytesWallet = sdk.generateTransactionBatchBytes(fromAddress, payload, {
    batcherPubkey: sdk.credentials.getPublic(),
    dependencies: [],
    familyName: SAWTOOTH_PAYMENT_PROCESSOR_FAMILY,
    familyVersion: '1.0',
    inputs: [EXO_SP_NAMESPACE],
    outputs: [EXO_SP_NAMESPACE],
    payloadEncoding: 'application/protobuf'
});

console.log('batchBytesWallet: ', batchBytesWallet);

```
## installation:

* install development branch:
```
npm i --save git://github.com:exo-dev/sawtooth-sdk-ionic#development --save
```
* install:
```
npm i --save git://github.com:exo-dev/sawtooth-sdk-ionic --save
```
