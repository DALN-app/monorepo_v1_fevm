// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Basic_FEVM_DALN is ERC721, ERC721Enumerable, AccessControl {
  using Counters for Counters.Counter;

  bytes32 public constant ADMIN = keccak256("ADMIN");

  struct TokenInfo {
    uint256 id;
    string cid;
    address owner;
    bool isDecrypted;
    uint256 price;
  }

  Counters.Counter private _tokenIdTracker;
  Counters.Counter private _activeTokensCount;

  mapping(uint256 => TokenInfo) private _tokenInfos;

  constructor() ERC721("Basic_FEVM_DALN", "DALN") {
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
  }

  function safeMint(string memory cid) public {
    require(balanceOf(_msgSender()) == 0, "Only 1 SBT per address allowed");

    uint256 tokenId = _tokenIdTracker.current();
    _tokenInfos[tokenId] = TokenInfo(tokenId, cid, _msgSender(), false, 0.72 ether);
    _tokenIdTracker.increment();
    _activeTokensCount.increment();
    _safeMint(_msgSender(), tokenId);
  }

  function _decryptSingle(uint256 tokenId) private {
    require(isAdmin(_msgSender()), "Caller is not an admin");
    require(_exists(tokenId), "Token does not exist");
    require(!_tokenInfos[tokenId].isDecrypted, "Token is already decrypted");

    _tokenInfos[tokenId].isDecrypted = true;
  }

  function _decryptMultiple(uint256[] memory tokenIds) private {
    require(isAdmin(_msgSender()), "Caller is not an admin");

    for (uint256 i = 0; i < tokenIds.length; i++) {
      _decryptSingle(tokenIds[i]);
    }
  }

  function decrypt(uint256[] memory tokenIds) public payable {
    uint256 totalPrice = 0;
    for (uint256 i = 0; i < tokenIds.length; i++) {
      uint256 tokenId = tokenIds[i];
      require(_exists(tokenId), "Token does not exist");
      require(!_tokenInfos[tokenId].isDecrypted, "Token is already decrypted");
      totalPrice += _tokenInfos[tokenId].price;
    }

    require(msg.value >= totalPrice, "Insufficient funds");

    _decryptMultiple(tokenIds);
  }

  function getTokenInfo(uint256 tokenId) public view returns (TokenInfo memory) {
    require(_exists(tokenId), "Token does not exist");
    return _tokenInfos[tokenId];
  }

  function getIsTokenDecrypted(uint256 tokenId) public view returns (bool) {
    if (!_exists(tokenId)) {
      return false;
    }

    return _tokenInfos[tokenId].isDecrypted;
  }

  function getTokenInfos(
    uint256 _cursor,
    uint256 _pageSize
  ) public view returns (TokenInfo[] memory, uint256 _nextCursor, bool _hasMore) {
    uint256 totalTokens = _tokenIdTracker.current();
    uint256 activeTokensCount = _activeTokensCount.current();

    require(_cursor < activeTokensCount, "Cursor is out of bounds");
    require(_pageSize > 0, "Page size must be greater than 0");
    require(totalTokens > 0, "No tokens exist");

    uint256 _overflownPageSize = _pageSize + 1;

    TokenInfo[] memory activeTokens = new TokenInfo[](_overflownPageSize);
    uint256 lastActiveTokenIndex = 0;

    // Loop through all tokens and add them to the activeTokens array if they are active until we reach the page size
    for (uint256 i = 0; i < totalTokens; i++) {
      // Skip tokens that are not active
      if (!_exists(i)) {
        continue;
      }

      // Skip tokens until we reach the cursor
      if (i < _cursor) {
        continue;
      }

      // Add the token to the activeTokens array
      activeTokens[lastActiveTokenIndex] = _tokenInfos[i];
      lastActiveTokenIndex++;

      // If we have reached the page size, break out of the loop
      if (lastActiveTokenIndex == _overflownPageSize) {
        break;
      }
    }

    // We only want to return the page size number of tokens, so if the last active token index is greater than the page size, we set it to the  page size
    uint256 lastActiveTokenIndexInPage = lastActiveTokenIndex > _pageSize ? _pageSize : lastActiveTokenIndex;

    // Resize the activeTokens array to the last active token index
    TokenInfo[] memory resizedActiveTokens = new TokenInfo[](lastActiveTokenIndexInPage);
    for (uint256 i = 0; i < lastActiveTokenIndexInPage; i++) {
      resizedActiveTokens[i] = activeTokens[i];
    }

    bool hasMore = lastActiveTokenIndex > _pageSize;

    // If there are more tokens to fetch, we need to return the next cursor, otherwise we return the max uint256 value
    uint256 nextCursor = hasMore ? _cursor + lastActiveTokenIndexInPage : type(uint256).max;

    return (resizedActiveTokens, nextCursor, hasMore);
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId,
    uint256 batchSize
  ) internal virtual override(ERC721, ERC721Enumerable) {
    require(from == address(0) || to == address(0), "This a soulbound token");
    super._beforeTokenTransfer(from, to, tokenId, batchSize);
  }

  function burn(uint256 tokenId) public virtual {
    require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");

    _activeTokensCount.decrement();
    delete _tokenInfos[tokenId];
    _burn(tokenId);
  }

  function isAdmin(address account) public view returns (bool) {
    return hasRole(ADMIN, account) || hasRole(DEFAULT_ADMIN_ROLE, account);
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view override(ERC721, ERC721Enumerable, AccessControl) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
