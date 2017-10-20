import KeyAdministrator from './key-administrator';
export default class Credentials {
    constructor(privateKey) {
        this.keyAdministrator = new KeyAdministrator(privateKey);
        this.keys = {
            privateKey: this.keyAdministrator.getPrivate(),
            publicKey: this.keyAdministrator.getPublic()
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
        return this.keyAdministrator.sign(data, privKey);
    }
}
