// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./DateTime.sol";
import "./TokenURI.sol";

error DesImages__InvalidDate();
error DesImages__FutureDate();
error DesImages__NotEnouthETHSent();
error DesImages__TokenNotForSale();
error DesImages__TokenNotForBurn();
error DesImages__CreatorTransferFail();
error DesImages__OwnerTransferFail();

contract DesImages is ERC721, ERC2981, Ownable, ReentrancyGuard {
    enum Status {
        FOR_SALE,
        MINTED,
        BURNED
    }

    struct TokenValue {
        Status status;
        uint128 ciphertext;
        uint32 date;
    }

    uint256 private constant INITIAL_PRICE = 0.01 ether;
    uint256 private constant LINEAR_COEFFICIENT = 0.001 ether;
    uint256 private constant RESERVE_CUT_OVER_10000 = 9950; // 99.5%
    uint96 private constant ROYALTY_OVER_10000 = 500; // 5%

    mapping(uint256 => uint256) private _tokenIndex;
    mapping(address => uint256[]) private _userOwnedTokens;
    mapping(uint256 => TokenValue) private _tokenValues;

    uint256 public totalSupply = 0;
    uint256 public totalEverMinted = 0;
    bool public paused = false;

    event Minted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 mintPrice,
        uint256 totalSupply,
        uint256 totalEverMinted
    );

    event Burned(
        address indexed from,
        uint256 indexed tokenId,
        uint256 burnReward,
        uint256 totalSupply
    );

    modifier whenPaused() {
        require(paused);
        _;
    }

    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    modifier validDate(uint32 date) {
        uint8 day = uint8(date & 0xff);
        uint8 month = uint8((date >> 8) & 0xf);
        uint16 year = uint16((date >> 12) & 0xffff);
        if (
            year < 2020 ||
            year > 9999 ||
            !DateTime.isValidDate(year, month, day)
        ) {
            revert DesImages__InvalidDate();
        }
        if (DateTime.timestampFromDate(year, month, day) > block.timestamp) {
            revert DesImages__FutureDate();
        }
        _;
    }

    constructor() ERC721("desImages", "DESIMGS") {
        _setDefaultRoyalty(msg.sender, ROYALTY_OVER_10000);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function pause() external onlyOwner whenNotPaused {
        paused = true;
    }

    function unpause() external onlyOwner whenPaused {
        paused = false;
    }

    function getTokenStatus(uint32 date, uint128 ciphertext)
        external
        view
        returns (Status)
    {
        uint256 tokenId = _getTokenId(date, ciphertext);
        return _tokenValues[tokenId].status;
    }

    function currentMintPrice() public view returns (uint256) {
        uint256 _totalSupply = totalSupply;
        return INITIAL_PRICE + _totalSupply * LINEAR_COEFFICIENT;
    }

    function currentBurnReward() public view returns (uint256) {
        uint256 _currentMintPrice = currentMintPrice();
        return _getReserveCut(_currentMintPrice - LINEAR_COEFFICIENT);
    }

    function _getReserveCut(uint256 mintPrice) private pure returns (uint256) {
        return (mintPrice * RESERVE_CUT_OVER_10000) / 10000; // 0.5%
    }

    function _getTokenId(uint32 date, uint128 ciphertext)
        private
        pure
        returns (uint256)
    {
        return uint256(keccak256(abi.encodePacked(date, ciphertext)));
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(tokenId), "ERC721: URI query for nonexistent token");

        TokenValue storage _tokenValue = _tokenValues[tokenId];
        return
            TokenURI.generateTokenURI(_tokenValue.date, _tokenValue.ciphertext);
    }

    function tokenIdsOf() external view returns (uint256[] memory) {
        return _userOwnedTokens[msg.sender];
    }

    function _addUserOwnedToken(address user, uint256 tokenId) private {
        uint256[] storage userOwnedTokens = _userOwnedTokens[user];
        _tokenIndex[tokenId] = userOwnedTokens.length;
        userOwnedTokens.push(tokenId);
    }

    function _removeUserOwnedToken(
        address user,
        uint256 tokenId,
        bool isBurn
    ) private {
        uint256[] storage userOwnedTokens = _userOwnedTokens[user];
        uint256 lastTokenIndex = userOwnedTokens.length - 1;
        uint256 tokenIndex = _tokenIndex[tokenId];
        if (tokenIndex != lastTokenIndex) {
            for (uint256 i = tokenIndex; i < lastTokenIndex; ++i) {
                uint256 _tokenId = userOwnedTokens[i + 1];
                userOwnedTokens[i] = _tokenId;
                _tokenIndex[_tokenId] = i;
            }
            // uint256 lastTokenId = userOwnedTokens[lastTokenIndex];
            // userOwnedTokens[tokenIndex] = lastTokenId;
            // _tokenIndex[lastTokenId] = tokenIndex;
        }
        userOwnedTokens.pop();
        if (isBurn) {
            delete _tokenIndex[tokenId];
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        if (from == address(0)) {
            // mint
            _addUserOwnedToken(to, tokenId);
        } else if (to == address(0)) {
            // burn
            _removeUserOwnedToken(from, tokenId, true);
        } else if (from != to) {
            // transfer
            _removeUserOwnedToken(from, tokenId, false);
            _addUserOwnedToken(to, tokenId);
        }
    }

    /*
     * This allows to mint hacks intentionally.
     */
    function mint(
        address recipient,
        uint32 date,
        uint128 ciphertext
    )
        external
        payable
        nonReentrant
        whenNotPaused
        validDate(date)
        returns (uint256)
    {
        uint256 mintPrice = currentMintPrice();
        if (msg.value < mintPrice) {
            revert DesImages__NotEnouthETHSent();
        }
        uint256 tokenId = _getTokenId(date, ciphertext);
        if (_tokenValues[tokenId].status != Status.FOR_SALE) {
            revert DesImages__TokenNotForSale();
        }
        _safeMint(recipient, tokenId);
        _tokenValues[tokenId] = TokenValue(Status.MINTED, ciphertext, date);
        totalEverMinted += 1;
        totalSupply += 1;

        // payable(owner()).transfer(mintPrice.sub(_getReserveCut(mintPrice)));
        (bool success, ) = payable(owner()).call{
            value: mintPrice - _getReserveCut(mintPrice)
        }("");
        if (!success) {
            revert DesImages__CreatorTransferFail();
        }

        if (msg.value > mintPrice) {
            // payable(msg.sender).transfer(msg.value.sub(mintPrice));
            (bool _success, ) = payable(msg.sender).call{
                value: msg.value - mintPrice
            }("");
            if (!_success) {
                revert DesImages__OwnerTransferFail();
            }
        }

        emit Minted(
            recipient,
            tokenId,
            mintPrice,
            totalSupply,
            totalEverMinted
        );

        return tokenId;
    }

    function burn(uint256 tokenId) external nonReentrant {
        TokenValue storage tokenValue = _tokenValues[tokenId];
        if (tokenValue.status != Status.MINTED) {
            revert DesImages__TokenNotForBurn();
        }
        uint256 burnReward = currentBurnReward();
        super._burn(tokenId);
        tokenValue.status = Status.BURNED;
        totalSupply -= 1;

        // payable(msg.sender).transfer(burnReward);
        (bool success, ) = payable(msg.sender).call{value: burnReward}("");
        if (!success) {
            revert DesImages__OwnerTransferFail();
        }
        emit Burned(msg.sender, tokenId, burnReward, totalSupply);
    }
}
