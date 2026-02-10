import { Factory } from '@muisit/cryptokey';

export async function resolveKey(value:string)
{
    const key = await Factory.resolve(value);
    await key.createPrivateKey();
    return {
        type: key.keyType,
        publicKey: key.exportPublicKey(),
        didKey: await Factory.toDIDKey(key),
        didJWK: await Factory.toDIDJWK(key),
        jwk: await Factory.toJWK(key)
    };
}
