const Description = () => (
  <div>
    <p className="mt-0">
      Referring to{' '}
      <a className="link" href="https://en.wikipedia.org/wiki/On_Kawara" target="_blank" rel="noreferrer">
        On Kawara
      </a>
      's telegram series, the plaintext{' '}
      <b>
        <i>i am still alive</i>
      </b>
      , 16{' '}
      <a className="link" href="https://en.wikipedia.org/wiki/ISO/IEC_8859-1" target="_blank" rel="noreferrer">
        ISO-8859-1
      </a>{' '}
      characters, is encrypted into a 128-bit ciphertext with the{' '}
      <a
        className="link"
        href="https://en.wikipedia.org/wiki/Data_Encryption_Standard"
        target="_blank"
        rel="noreferrer"
      >
        DES
      </a>{' '}
      algorithm in the ECB mode.
    </p>
    <p>
      This ciphertext is then divided up into 16 units of 8-bit value. Each unit is used to derive the shades of 16
      squares, which are layered on top of each other in the similar manner seen in a series of paintings{' '}
      <a
        className="link"
        href="https://en.wikipedia.org/wiki/Josef_Albers#Homage_to_the_Square"
        target="_blank"
        rel="noreferrer"
      >
        <i>Homage to the Square</i>
      </a>{' '}
      by{' '}
      <a className="link" href="https://en.wikipedia.org/wiki/Josef_Albers" target="_blank" rel="noreferrer">
        Josef Albers
      </a>
      . The leftmost 8-bit value corresponds to the shade of the outermost square, while the rightmost value corresponds
      to the shade of the innermost square.
    </p>
    <p className="mb-0">
      Each token is titled with a{' '}
      <a
        className="link"
        href="https://en.wikipedia.org/wiki/Coordinated_Universal_Time"
        target="_blank"
        rel="noreferrer"
      >
        UTC
      </a>{' '}
      date between 2020-01-01 and the current block's timestamp date in the{' '}
      <a className="link" href="https://en.wikipedia.org/wiki/ISO_8601" target="_blank" rel="noreferrer">
        ISO-8601
      </a>{' '}
      format (YYYYMMDD). These 8 ISO-8859-1 characters form a 64-bit key for the DES algorithm.
    </p>
  </div>
);

export default Description;
