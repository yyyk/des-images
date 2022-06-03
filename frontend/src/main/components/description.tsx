import ExternalLink from 'src/shared/components/externalLink';

const Description = () => (
  <div>
    <p className="mt-0">
      Referring to <ExternalLink href="https://en.wikipedia.org/wiki/On_Kawara">On Kawara</ExternalLink>
      's telegram series, the plaintext{' '}
      <b>
        <i>i am still alive</i>
      </b>
      , 16 <ExternalLink href="https://en.wikipedia.org/wiki/ISO/IEC_8859-1">ISO-8859-1</ExternalLink> characters, is
      encrypted into a 128-bit ciphertext with the{' '}
      <ExternalLink href="https://en.wikipedia.org/wiki/Data_Encryption_Standard">DES</ExternalLink> algorithm in the
      ECB mode.
    </p>
    <p>
      This ciphertext is then divided up into 16 units of 8-bit value. Each unit is used to derive the shades of 16
      squares, which are layered on top of each other in the similar manner seen in a series of paintings{' '}
      <ExternalLink href="https://en.wikipedia.org/wiki/Josef_Albers#Homage_to_the_Square">
        <i>Homage to the Square</i>
      </ExternalLink>{' '}
      by <ExternalLink href="https://en.wikipedia.org/wiki/Josef_Albers">Josef Albers</ExternalLink>. The leftmost 8-bit
      value corresponds to the shade of the outermost square, while the rightmost value corresponds to the shade of the
      innermost square.
    </p>
    <p className="mb-0">
      Each token is titled with a{' '}
      <ExternalLink href="https://en.wikipedia.org/wiki/Coordinated_Universal_Time">UTC</ExternalLink> date between
      2020-01-01 and the current block's timestamp date in the{' '}
      <ExternalLink href="https://en.wikipedia.org/wiki/ISO_8601">ISO-8601</ExternalLink> format (YYYYMMDD). These 8
      ISO-8859-1 characters form a 64-bit key for the DES algorithm.
    </p>
  </div>
);

export default Description;
