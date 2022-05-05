const Supplement = () => {
  return (
    <div>
      <p className="mt-0">
        If you have tried different dates a few times, you might have encountered the same looking image generated for
        different dates. In other words, <strong>two or more different keys have produced the same ciphertext.</strong>
      </p>
      <p>
        Only the first 7 bits of each byte are actual material in a DES key. This means <code>00000000</code> and{' '}
        <code>00000001</code>
        end up being the same value.
      </p>
      <p>
        The assigned number for <i>0</i> in ASCII-based standard character encodings is 48, while the one for <i>1</i>{' '}
        is 49. In the binary representation, 48 is <code>00110000</code> and 49 is <code>00110001</code>. The DES
        algorithm treats them as the same character. This applies to the pairs of <i>2</i> and <i>3</i>, <i>4</i> and{' '}
        <i>5</i>, <i>6</i> and <i>7</i>, and <i>8</i> and <i>9</i>.
      </p>
      <p>
        <strong>
          The image, though, appears to be the same as another token due to the reason above, the uniqueness of token
          IDs are protected. When a token is minted, its token ID is generated from the set of the date and the
          ciphertext. The smart contract checks if the ID already exists. If not, the token gets minted.
        </strong>
      </p>
      <p>
        Furthermore, the <code>&lt;title&gt;</code> element of the token's image SVG includes the date, while the
        <code>&lt;rect&gt;</code> elements indicate the ciphertext to complete the formula. By taking the last two
        characters from the hexadecimal fill-color values of each <code>&lt;rect&gt;</code> element, the ciphertext can
        be reconstructed.
      </p>
      <p className="mb-0">
        With the case of <i>#20200101</i>, decrypting the ciphertext{' '}
        <code style={{ wordBreak: 'break-all' }}>0x79030f7920aaa3cfbbd92afbb93e70ba</code> with the key{' '}
        <code>20200101</code>, using the DES algorithm, reveals the message: <code>i am still alive</code>
      </p>
    </div>
  );
};

export default Supplement;
