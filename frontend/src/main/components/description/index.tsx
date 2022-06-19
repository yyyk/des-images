import ExternalLink from 'src/shared/components/externalLink';

const Description = () => (
  <div className="sm:text-lg sm:leading-8">
    <p className="mt-0">
      <b>
        <i>i am still alive</i>
      </b>{' '}
      is a plaintext made up of sixteen{' '}
      <ExternalLink href="https://en.wikipedia.org/wiki/ISO/IEC_8859-1">ISO-8859-1</ExternalLink> characters encrypted
      into a 128-bit ciphertext using the{' '}
      <ExternalLink href="https://en.wikipedia.org/wiki/Data_Encryption_Standard">DES</ExternalLink> algorithm in ECB
      mode. The phrase refers to Japanese artist{' '}
      <ExternalLink href="https://en.wikipedia.org/wiki/On_Kawara">On Kawara</ExternalLink>'s canonical series of
      telegram artworks from 1969.
    </p>
    <p>
      Upon encryption, the ciphertext is then divided up into sixteen units of 8-bit value. Each unit is used to derive
      the shades of sixteen squares, which are layered on each other in a manner similar to the paintings{' '}
      <ExternalLink href="https://en.wikipedia.org/wiki/Josef_Albers#Homage_to_the_Square">
        <i>Homage to the Square</i>
      </ExternalLink>{' '}
      by German-American artist{' '}
      <ExternalLink href="https://en.wikipedia.org/wiki/Josef_Albers">Josef Albers</ExternalLink>. The leftmost 8-bit
      value corresponds to the shade of the outermost square, while the rightmost value corresponds to the shade of the
      innermost square.
    </p>
    <p className="mb-0">
      Each token is titled with a{' '}
      <ExternalLink href="https://en.wikipedia.org/wiki/Coordinated_Universal_Time">UTC</ExternalLink> date written in
      the <ExternalLink href="https://en.wikipedia.org/wiki/ISO_8601">ISO-8601</ExternalLink> format (YYYYMMDD) between
      2020-01-01 and the timestamp date of the current block. These eight ISO-8859-1 characters form a 64-bit key for
      the DES algorithm.
    </p>
  </div>
);

export default Description;
