// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

library TokenURI {
    using Strings for uint16;
    using Strings for uint8;

    function generateTitle(uint32 date) internal pure returns (string memory) {
        uint8 day = uint8(date & 0xff);
        uint8 month = uint8((date >> 8) & 0xf);
        uint16 year = uint16((date >> 12) & 0xffff);
        return
            string(
                abi.encodePacked(
                    "desImages#",
                    year.toString(),
                    month < 10
                        ? string(abi.encodePacked("0", month.toString()))
                        : month.toString(),
                    day < 10
                        ? string(abi.encodePacked("0", day.toString()))
                        : day.toString()
                )
            );
    }

    function generateFill(
        uint8 index,
        uint128 ciphertext,
        string[16] memory table
    ) internal pure returns (string memory) {
        uint8 i = index * 8;
        uint128 value = ciphertext >> i;
        string memory r = table[value & 0xf];
        string memory l = table[(value >> 4) & 0xf];
        return string(abi.encodePacked('fill="#', l, r, l, r, l, r, '"'));
    }

    function generateRects(uint128 ciphertext)
        internal
        pure
        returns (string memory)
    {
        string[16] memory hexTable = [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "a",
            "b",
            "c",
            "d",
            "e",
            "f"
        ];
        string memory rects;
        for (uint8 i = 0; i < 16; ++i) {
            string memory size = (i * 8 + 8).toString();
            rects = string(
                abi.encodePacked(
                    '<rect x="',
                    (60 - i * 4).toString(),
                    '" y="',
                    (90 - i * 6).toString(),
                    '" width="',
                    size,
                    '" height="',
                    size,
                    '" ',
                    generateFill(i, ciphertext, hexTable),
                    ' stroke="none"/>',
                    rects
                )
            );
        }
        return rects;
    }

    function generateTokenURI(uint32 date, uint128 ciphertext)
        internal
        pure
        returns (string memory)
    {
        string memory title = generateTitle(date);
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                title,
                                '","description":"Referring to On Kawara\'s telegram series, the plaintext \'i am still alive\', 16 ISO-8859-1 characters, is encrypted into a 128-bit ciphertext with the DES algorithm in the ECB mode. This ciphertext is then divided up into 16 units of 8-bit value. Each unit is used to derive the shades of 16 squares, which are layered on top of each other in the similar manner seen in a series of paintings \'Homage to the Square\' by Josef Albers. The leftmost 8-bit value corresponds to the shade of the outermost square, while the rightmost value corresponds to the shade of the innermost square. Each token is titled with a UTC date between 2020-01-01 and the current block\'s timestamp date in the ISO-8601 format (YYYYMMDD). These 8 ISO-8859-1 characters form a 64-bit key for the DES algorithm.","image":"',
                                string(
                                    abi.encodePacked(
                                        "data:image/svg+xml;base64,",
                                        Base64.encode(
                                            bytes(
                                                abi.encodePacked(
                                                    string(
                                                        abi.encodePacked(
                                                            '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="512" height="512" viewBox="0 0 128 128"><title>',
                                                            title,
                                                            "</title>",
                                                            generateRects(
                                                                ciphertext
                                                            ),
                                                            "</svg>"
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    )
                                ),
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}
