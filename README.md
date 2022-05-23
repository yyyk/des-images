# desImages NFT

Referring to [On Kawara](https://en.wikipedia.org/wiki/On_Kawara)'s telegram series, the plaintext ***i am still alive***, 16 [ISO-8859-1](https://en.wikipedia.org/wiki/ISO/IEC_8859-1) characters, is encrypted into a 128-bit ciphertext with the [DES](https://en.wikipedia.org/wiki/Data_Encryption_Standard) algorithm in the ECB mode.

This ciphertext is then divided up into 16 units of 8-bit value. Each unit is used to derive the shades of 16 squares, which are layered on top of each other in the similar manner seen in a series of paintings *[Homage to the Square](https://en.wikipedia.org/wiki/Josef_Albers#Homage_to_the_Square)* by [Josef Albers](https://en.wikipedia.org/wiki/Josef_Albers). The leftmost 8-bit value corresponds to the shade of the outermost square, while the rightmost value corresponds to the shade of the innermost square.

Each token is titled with a [UTC](https://en.wikipedia.org/wiki/Coordinated_Universal_Time) date between 2020-01-01 and the current block's timestamp date in the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) format (YYYYMMDD). These 8 ISO-8859-1 characters form a 64-bit key for the DES algorithm.

### `/contract`

contains solidity files

### `/frontend`

contains react frontend app
