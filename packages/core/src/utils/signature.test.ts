import { generateSignature } from './signature.js';

describe('generateSignature()', () => {
  it('should generate correct signature', () => {
    const signingKey = 'foo';
    const payload = {
      foo: 'foo',
      bar: 'bar',
    };

    const signature = generateSignature(signingKey, payload);

    expect(signature).toBe(
      'sha256=436958f1dbfefab37712fb3927760490fbf7757da8c0b2306ee7b485f0360eee'
    );
  });

  it('should generate correct signature if payload is empty', () => {
    const signingKey = 'foo';
    const payload = {};
    const signature = generateSignature(signingKey, payload);

    expect(signature).toBe(
      'sha256=c76356efa19d219d1d7e08ccb20b1d26db53b143156f406c99dcb8e0876d6c55'
    );
  });

  it('should generate the same signature if payload contents are the same but payload JSON strings are not the same', () => {
    const signingKey = 'foo';

    const payload = {
      foo: 'foo',
      bar: {
        baz: 'baz',
      },
    };

    const disorderedPayload = {
      bar: {
        baz: 'baz',
      },
      foo: 'foo',
    };

    const signature = generateSignature(signingKey, payload);
    const signatureByDisorderedPayload = generateSignature(signingKey, disorderedPayload);

    expect(JSON.stringify(payload)).not.toEqual(JSON.stringify(disorderedPayload));
    expect(signature).toEqual(signatureByDisorderedPayload);
  });
});
