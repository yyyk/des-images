import Code from 'src/mod/components/code';
import ExternalLink from 'src/shared/components/externalLink';

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
      The token ID is derived from the set of a date and a ciphertext. This means that any 128-bit ciphertext can be
      applicable as long as a valid date is provided.
    </p>
    <p>
      One could utilize ciphertexts to control the shades of the squares. The image above, <i>#20200101</i>, for
      example, is produced with the ciphertext <Code wordBreak>0x00112233445566778899aabbccddeeff</Code>. This method,
      however, comes with a drawback. The decrypted plaintext often ends up being gibberish, like{' '}
      <Code wordBreak>À¾ò/\x02Z%\x18\x13=øÃ9®À\x16</Code> with the case of <i>#20200101</i>.
    </p>
    <p className="mb-0">
      Another might set plaintexts other than <Code>i am still alive</Code>. Any text that is comprised of 16{' '}
      <ExternalLink href="https://en.wikipedia.org/wiki/ISO/IEC_8859-1">ISO-8859-1</ExternalLink> characters can be used
      as a plaintext. For example, the key <Code>20200101</Code> and the plaintext <Code>i slept a lot...</Code>{' '}
      produces the ciphertext <Code wordBreak>0x037930445f93917bcef86c15501f3069</Code>. The resulting image might not
      be so different from the ones with <Code>i am still alive</Code>, but this method can <i>attach</i> different
      messages to tokens.
    </p>
  </div>
);

export default Description;
