import { Factory } from '@muisit/cryptokey';

export async function createKey(type:string)
{
    const key = await Factory.createFromType(type);
    await key.createPrivateKey();
    return {
        type: type,
        privateKey: key.exportPrivateKey(),
        publicKey: key.exportPublicKey(),
        didKey: await Factory.toDIDKey(key),
        didJWK: await Factory.toDIDJWK(key),
        jwk: await Factory.toJWK(key)
    };
}
