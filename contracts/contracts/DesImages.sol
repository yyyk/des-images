// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./DateTime.sol";
import "./TokenURI.sol";

error DesImages__InvalidDate();
error DesImages__FutureDate();
error DesImages__NotEnouthETHSent();
error DesImages__TokenNotForSale();
error DesImages__TokenNotForBurn();

contract DesImages is ERC721, ERC2981, Ownable {
    using SafeMath for uint256;

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
    // uint256 private constant MAX_PER_WALLET_BALANCES = 10;

    mapping(uint256 => uint256) private _tokenIndex;
    mapping(address => uint256[]) private _userOwnedTokens;
    mapping(uint256 => TokenValue) private _tokenValues;
    // mapping(address => uint256) private _walletBalances;

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
        // require(
        //     year >= 2020 &&
        //         year <= 9999 &&
        //         DateTime.isValidDate(year, month, day),
        //     "Invalid Date"
        // );
        // require(
        //     DateTime.timestampFromDate(year, month, day) <= block.timestamp,
        //     "Cannot be future date"
        // );
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

    function isOwnerOf(uint32 date, uint128 ciphertext)
        external
        view
        returns (bool)
    {
        return ownerOf(_getTokenId(date, ciphertext)) == msg.sender;
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
        return INITIAL_PRICE.add(_totalSupply.mul(LINEAR_COEFFICIENT));
    }

    function currentBurnReward() public view returns (uint256) {
        uint256 _currentMintPrice = currentMintPrice();
        return _getReserveCut(_currentMintPrice.sub(LINEAR_COEFFICIENT));
    }

    function _getReserveCut(uint256 mintPrice) private pure returns (uint256) {
        return mintPrice.mul(RESERVE_CUT_OVER_10000).div(10000); // 0.5%
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

    function getTokenIds() external view returns (uint256[] memory) {
        // uint256 len = balanceOf(_owner);
        // uint256[] memory _tokensOfOwner = new uint256[](len);
        // for (uint256 i = 0; i < len; ++i) {
        //     _tokensOfOwner[i] = tokenOfOwnerByIndex(_owner, i);
        // }
        // return _tokensOfOwner;
        return _userOwnedTokens[msg.sender];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        if (from == address(0)) {
            // mint
            uint256[] storage userOwnedTokens = _userOwnedTokens[to];
            _tokenIndex[tokenId] = userOwnedTokens.length;
            userOwnedTokens.push(tokenId);
        } else if (to == address(0)) {
            // burn
            uint256[] storage userOwnedTokens = _userOwnedTokens[from];
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
            delete _tokenIndex[tokenId];
        } else if (from != to) {
            // transfer
            uint256[] storage userOwnedTokensFrom = _userOwnedTokens[from];
            uint256 lastTokenIndex = userOwnedTokensFrom.length - 1;
            uint256 tokenIndex = _tokenIndex[tokenId];
            for (uint256 i = tokenIndex; i < lastTokenIndex; ++i) {
                uint256 _tokenId = userOwnedTokensFrom[i + 1];
                userOwnedTokensFrom[i] = _tokenId;
                _tokenIndex[_tokenId] = i;
            }
            userOwnedTokensFrom.pop();

            uint256[] storage userOwnedTokensTo = _userOwnedTokens[to];
            _tokenIndex[tokenId] = userOwnedTokensTo.length;
            userOwnedTokensTo.push(tokenId);
        }
    }

    /*
     * This allows to mint hacks intentionally.
     */
    function mint(
        address recipient,
        uint32 date,
        uint128 ciphertext
    ) external payable whenNotPaused validDate(date) returns (uint256) {
        // require(
        //     _walletBalances[msg.sender] < MAX_PER_WALLET_BALANCES,
        //     "Max amount exceeded"
        // );
        uint256 mintPrice = currentMintPrice(); //_bondingCurve(totalSupply);
        // require(msg.value >= mintPrice, "Not enough ETH sent");
        if (msg.value < mintPrice) {
            revert DesImages__NotEnouthETHSent();
        }

        uint256 tokenId = _getTokenId(date, ciphertext);
        // require(_tokenValues[tokenId].status == Status.FOR_SALE);
        if (_tokenValues[tokenId].status != Status.FOR_SALE) {
            revert DesImages__TokenNotForSale();
        }
        _safeMint(recipient, tokenId);
        _tokenValues[tokenId] = TokenValue(Status.MINTED, ciphertext, date);
        totalEverMinted = totalEverMinted.add(1);
        totalSupply = totalSupply.add(1);
        // _walletBalances[msg.sender] += 1;

        payable(owner()).transfer(mintPrice.sub(_getReserveCut(mintPrice)));
        //// nonReentrant needed
        // (bool success, ) = payable(owner()).call{
        //     value: mintPrice.sub(_getReserveCut(mintPrice))
        // }("");
        // require(success);

        if (msg.value > mintPrice) {
            payable(msg.sender).transfer(msg.value.sub(mintPrice));
            // (bool _success, ) = payable(msg.sender).call{
            //     value: msg.value.sub(mintPrice)
            // }("");
            // require(_success, "something went wrong");
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

    function burn(uint256 tokenId) external {
        TokenValue storage tokenValue = _tokenValues[tokenId];
        // require(tokenValue.status == Status.MINTED);
        if (tokenValue.status != Status.MINTED) {
            revert DesImages__TokenNotForBurn();
        }
        uint256 burnReward = currentBurnReward(); // _getReserveCut(_bondingCurve(totalSupply - 1));
        super._burn(tokenId);
        tokenValue.status = Status.BURNED;
        totalSupply = totalSupply.sub(1);
        // _walletBalances[msg.sender] -= 1;
        payable(msg.sender).transfer(burnReward);
        // (bool success, ) = payable(msg.sender).call{
        //     value: _getReserveCut(currentMintPrice())
        // }("");
        // require(success, "something went wrong");
        emit Burned(msg.sender, tokenId, burnReward, totalSupply);
    }
}
