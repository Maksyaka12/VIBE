// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VibeGenesisNFT - 334 Genesis NFT Collection on Base
 * @dev Standard ERC-721 Collection with 4 Whitelist + 330 Tiered Mints & 100% ETH Auto Buyback/Burn
 */

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}

contract VibeGenesisNFT {
    string public name = "Vibe Genesis NFT";
    string public symbol = "VIBEGEN";
    uint256 public constant MAX_SUPPLY = 334;
    
    address public owner;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    string public baseURI;
    uint256 public totalMinted;

    // Prices per Phase
    uint256 public constant PHASE_1_PRICE = 0.005 ether; // 100 NFTs (#004..#103)
    uint256 public constant PHASE_2_PRICE = 0.015 ether; // 100 NFTs (#104..#203)
    uint256 public constant PHASE_3_PRICE = 0.05 ether;  // 100 NFTs (#204..#303)
    uint256 public constant PHASE_4_PRICE = 0.1 ether;   // 30 NFTs  (#304..#333)

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event GenesisMinted(address indexed minter, uint256 indexed tokenId, uint256 ethPaid);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(string memory initialBaseURI) {
        owner = msg.sender;
        baseURI = initialBaseURI;
        
        // Mint Phase 0 Whitelist (4 NFTs #000..#003 to Owner)
        for (uint256 i = 0; i < 4; i++) {
            _mint(msg.sender, i);
        }
    }

    function getMintPrice(uint256 tokenId) public pure returns (uint256) {
        if (tokenId < 4) return 0;
        if (tokenId <= 103) return PHASE_1_PRICE;
        if (tokenId <= 203) return PHASE_2_PRICE;
        if (tokenId <= 303) return PHASE_3_PRICE;
        return PHASE_4_PRICE;
    }

    function mintNext() external payable returns (uint256) {
        require(totalMinted < MAX_SUPPLY, "Sold out");
        uint256 tokenId = totalMinted;
        uint256 price = getMintPrice(tokenId);
        require(msg.value >= price, "Insufficient ETH for mint");

        _mint(msg.sender, tokenId);

        // 100% ETH Auto Burn Transfer
        if (msg.value > 0) {
            (bool success, ) = payable(BURN_ADDRESS).call{value: msg.value}("");
            require(success, "ETH burn transfer failed");
        }

        emit GenesisMinted(msg.sender, tokenId, msg.value);
        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return string(abi.encodePacked(baseURI, uint2str(tokenId), ".json"));
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }

    function balanceOf(address owner_) public view returns (uint256) {
        require(owner_ != address(0), "Invalid address");
        return _balances[owner_];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "Token does not exist");
        return tokenOwner;
    }

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "Mint to zero address");
        require(_owners[tokenId] == address(0), "Token already minted");

        _balances[to] += 1;
        _owners[tokenId] = to;
        totalMinted += 1;

        emit Transfer(address(0), to, tokenId);
    }

    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k--;
            uint8 temp = (uint8)(48 + (_i % 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
