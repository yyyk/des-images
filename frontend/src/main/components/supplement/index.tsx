const Supplement = () => {
  return (
    <div className="sm:text-lg sm:leading-8">
      <h4 className="mt-0">Key Clustering:</h4>
      <p>
        When entering different dates, it is possible to encounter images generated for different dates that look the
        same. This is a product of a situation where two or more different keys produce the same ciphertext.
      </p>
      <p>
        The assigned number for <i>0</i> in ASCII-based standard character encodings is forty-eight, while 1 is
        forty-nine. In binary representation, forty-eight is <code>00110000</code> and forty-nine is{' '}
        <code>00110001</code>. The DES algorithm treats them as the same character because only the first seven bits of
        each byte are actual material in a DES key. This applies to the pairs of <i>2</i> and <i>3</i>, <i>4</i> and{' '}
        <i>5</i>, <i>6</i> and <i>7</i>, and <i>8</i> and <i>9</i>.
      </p>
      <h4>Protection of token uniqueness:</h4>
      <p>
        Even though images can appear the same as other tokens due to key clustering (as described above), the
        uniqueness of each token ID is protected.
      </p>
      <p>
        When a token is minted, its token ID is generated from the set of the date and the ciphertext. The smart
        contract system then checks if the ID already exists. If not, the token can be minted.
      </p>
      <p>
        Furthermore, the key is included in the <code>&lt;title&gt;</code> element of the token's image SVG, along with
        the <code>&lt;rect&gt;</code> elements indicating the ciphertext.
      </p>
      <h4>Decipherment:</h4>
      <p>
        The hexadecimal ciphertext can be reconstructed by taking the last two characters from the hexadecimal
        fill-color values of each <code>&lt;rect&gt;</code> element, while the key can be found in the{' '}
        <code>&lt;title&gt;</code> element.
      </p>
      <p className="mb-0">
        With the case of <i>#20200101</i>, the ciphertext{' '}
        <code style={{ wordBreak: 'break-all' }}>0x79030f7920aaa3cfbbd92afbb93e70ba</code> can be decrypted with the key{' '}
        <code>20200101</code> using the DES algorithm, and it reveals the plaintext: <code>i am still alive</code>.
      </p>
    </div>
  );
};

export default Supplement;
