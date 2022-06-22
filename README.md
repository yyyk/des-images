# desImages NFT

**i am still alive** is a plaintext made up of sixteen [ISO-8859-1](https://en.wikipedia.org/wiki/ISO/IEC_8859-1) characters encrypted into a 128-bit ciphertext using the [DES](https://en.wikipedia.org/wiki/Data_Encryption_Standard) algorithm in ECB mode. The phrase refers to Japanese artist [On Kawara](https://en.wikipedia.org/wiki/On_Kawara)'s canonical series of telegram artworks from 1969.

Upon encryption, the ciphertext is then divided up into sixteen units of 8-bit value. Each unit is used to derive the shades of sixteen squares, which are layered on each other in a manner similar to the paintings *[Homage to the Square](https://en.wikipedia.org/wiki/Josef_Albers#Homage_to_the_Square)* by German-American artist [Josef Albers](https://en.wikipedia.org/wiki/Josef_Albers). The leftmost 8-bit value corresponds to the shade of the outermost square, while the rightmost value corresponds to the shade of the innermost square.

Each token is titled with a [UTC](https://en.wikipedia.org/wiki/Coordinated_Universal_Time) date written in the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) format (YYYYMMDD) between 2020-01-01 and the timestamp date of the current block. These eight ISO-8859-1 characters form a 64-bit key for the DES algorithm.

### `/contract`

contains solidity files

### `/frontend`

contains react frontend app

### DES decryption examples

#### Node.js

```js
const crypto = require('crypto');

const algorithm = 'des-ecb';
const key = Buffer.from('20200101', 'latin1');
const ciphertext = '79030f7920aaa3cfbbd92afbb93e70ba';
const decipher = crypto.createDecipheriv(algorithm, key, null);
decipher.setAutoPadding(false);
let plaintext = decipher.update(ciphertext, 'hex', 'latin1');
plaintext += decipher.final('latin1');
console.log(plaintext) // 'i am still alive'
```

#### Python

```python
from Crypto.Cipher import DES

key = b"20200101"
ciphertext = bytes.fromhex("79030f7920aaa3cfbbd92afbb93e70ba")
des = DES.new(key, DES.MODE_ECB)
plaintext = des.decrypt(ciphertext)
print(plaintext) # b'i am still alive'
```
