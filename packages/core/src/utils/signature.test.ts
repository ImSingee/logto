import { generateSignature } from './signature.js';

describe('generateSignature()', () => {
  it('should generate correct signature', () => {
    const signingKey = 'foo';
    const payload = {
      bar: 'bar',
      foo: 'foo',
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
});
