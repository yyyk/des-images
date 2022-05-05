const Description = () => (
  <div>
    <blockquote className="mt-0">
      With the case of <i>#20200101</i>, decrypting the ciphertext{' '}
      <i style={{ wordBreak: 'break-all' }}>0x79030f7920aaa3cfbbd92afbb93e70ba</i> with the key <i>20200101</i>, using
      the DES algorithm, reveals the message:{' '}
      <i>
        <b>i am still alive</b>
      </i>
    </blockquote>
    <p>
      The token ID is generated from the set of a date and a ciphertext. This means that any 128-bit ciphertext can be
      applicable as long as a valid date is provided.
    </p>
    <p>
      One could utilize ciphertexts to control the shades of the squares. The image above, <i>#20200101</i>, for
      example, is produced with the ciphertext{' '}
      <code style={{ wordBreak: 'break-all' }} className="bg-neutral">
        0x00112233445566778899aabbccddeeff
      </code>
      . This method, however, comes with a drawback. The decrypted plaintext often ends up being gibberish, like{' '}
      <code style={{ wordBreak: 'break-all' }} className="bg-neutral">
        À¾ò/\x02Z%\x18\x13=øÃ9®À\x16
      </code>{' '}
      with the case of <i>#20200101</i>.
    </p>
    <p className="mb-0">
      Another might set plaintexts other than <code className="bg-neutral">i am still alive</code>. Any text that is
      comprised of 16{' '}
      <a className="link" href="https://en.wikipedia.org/wiki/ISO/IEC_8859-1" target="_blank" rel="noreferrer">
        ISO-8859-1
      </a>{' '}
      characters can be used as a plaintext. For example, the key <code className="bg-neutral">20200101</code> and the
      plaintext <code className="bg-neutral">i slept a lot...</code> produces the ciphertext{' '}
      <code style={{ wordBreak: 'break-all' }} className="bg-neutral">
        0x037930445f93917bcef86c15501f3069
      </code>
      . The resulting image might not be so different from the ones with{' '}
      <code className="bg-neutral">i am still alive</code>, but this method can <i>attach</i> different messages to
      tokens.
    </p>
  </div>
);

export default Description;
