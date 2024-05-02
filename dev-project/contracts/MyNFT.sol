// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, ERC721Enumerable, Ownable {

    uint256 private _nextTokenId;

    // Mapping to store color hex value against token IDs
    mapping(uint256 => string) private _tokenColors;

    constructor(address initialOwner)
        ERC721("MyNFT", "MTK")
        Ownable(initialOwner)
    {}

    function safeMint(address to, string memory color) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _tokenColors[tokenId] = color;
    }

    // Function to retrieve the color associated with a token ID
    function getTokenColor(uint256 tokenId) public view returns (string memory) {
        return _tokenColors[tokenId];
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}