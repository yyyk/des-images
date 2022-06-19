import Code from 'src/mod/components/code';
import ExternalLink from 'src/shared/components/externalLink';

const Description = () => (
  <div className="sm:text-lg sm:leading-8">
    <blockquote className="mt-0">
      With the case of <i>#20200101</i>, the ciphertext <Code wordBreak>0x79030f7920aaa3cfbbd92afbb93e70ba</Code> can be
      decrypted with the key <Code>20200101</Code> using the DES algorithm, and it reveals the plaintext:{' '}
      <Code>i am still alive</Code>.
    </blockquote>
    <p>
      Token IDs are derived from the set of a date and a ciphertext. This means that any 128-bit ciphertext can be
      applicable as long as a valid date is provided.
    </p>
    <p>
      One could utilize ciphertexts to control the shades of the squares. The image above, for example, <i>#20200101</i>
      , is produced with the ciphertext <Code wordBreak>0x00112233445566778899aabbccddeeff</Code>. This method, however,
      comes with a drawback. The decrypted plaintext often ends up being gibberish because deriving readable plaintext
      from ciphertext is quite difficult: <Code wordBreak>À¾ò/\x02Z%\x18\x13=øÃ9®À\x16</Code> with the case of{' '}
      <i>#20200101</i>.
    </p>
    <p className="mb-0">
      Other people could also use plaintexts other than <Code>i am still alive</Code>. Any text that is composed of
      sixteen <ExternalLink href="https://en.wikipedia.org/wiki/ISO/IEC_8859-1">ISO-8859-1</ExternalLink> characters can
      be used as a plaintext. For example, the key <Code>20200101</Code> and the plaintext <Code>i slept a lot...</Code>{' '}
      produces the ciphertext <Code wordBreak>0x037930445f93917bcef86c15501f3069</Code>. The resulting image might not
      be so different from the ones with <Code>i am still alive</Code>, but, in this way, different messages can be
      attached to tokens.
    </p>
  </div>
);

export default Description;
