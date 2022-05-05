// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "../DesImages.sol";

contract MinterBurner is IERC721Receiver {
    bytes4 constant ERC721_RECEIVED =
        bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));

    enum ROLE {
        SAFE,
        MALICIOUS_MINTER,
        MALICIOUS_BURNER
    }

    address public owner;
    uint256 public tokenId;
    uint128 public ciphertext;
    uint32 public date;
    ROLE public role;
    bool public isBurning;

    constructor(
        uint32 _date,
        uint128 _ciphertext,
        ROLE _role
    ) {
        owner = msg.sender;
        date = _date;
        ciphertext = _ciphertext;
        role = _role;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return ERC721_RECEIVED;
    }

    function setTokenId(uint256 _tokenId) public {
        tokenId = _tokenId;
    }

    function mint(address _address) public payable {
        DesImages(_address).mint{value: address(this).balance}(
            msg.sender,
            date,
            ciphertext
        );
    }

    function burn(address _address) public {
        isBurning = true;
        DesImages(_address).burn(tokenId);
        isBurning = false;
    }

    fallback() external payable {
        if (
            role == ROLE.MALICIOUS_MINTER &&
            address(msg.sender).balance > 0.001 ether
        ) {
            mint(msg.sender);
        }
        if (
            isBurning &&
            role == ROLE.MALICIOUS_BURNER &&
            address(msg.sender).balance > 0.001 ether
        ) {
            burn(msg.sender);
        }
    }

    receive() external payable {
        if (
            role == ROLE.MALICIOUS_MINTER &&
            address(msg.sender).balance > 0.001 ether
        ) {
            mint(msg.sender);
        }
        if (
            isBurning &&
            role == ROLE.MALICIOUS_BURNER &&
            address(msg.sender).balance > 0.001 ether
        ) {
            burn(msg.sender);
        }
    }
}
