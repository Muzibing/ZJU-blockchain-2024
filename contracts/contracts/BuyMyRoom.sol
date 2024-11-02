// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment the line to use openzeppelin/ERC721,ERC20
// You can use this dependency directly because it has been installed by TA already
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract BuyMyRoom is ERC721Enumerable, Ownable {
    // use a event if you want
    // to represent time you can choose block.timestamp
    event HouseListed(uint256 tokenId, uint256 price, address owner);
    event HouseSold(uint256 tokenId, address indexed buyer, uint256 price);

    // maybe you need a struct to store car information
    struct House {
        address owner;
        uint256 listedTimestamp;
        uint256 price;
        bool isListed;
    }

    mapping(uint256 => House) public houses; // A map from house-index to its information

    // ...
    // TODO add any variables and functions if you want
    uint256 public nextHouseId = 0;
    address public feeRecipient;
    uint256 public feeRate = 1;

    constructor() ERC721("HouseNFT", "HNFT") Ownable(msg.sender) {
        // maybe you need a constructor

        feeRecipient = msg.sender;
    }

    function helloworld() external pure returns (string memory) {
        return "hello world";
    }

    // ...
    // TODO add any logic if you want

    function mintHouse(address recipient) external onlyOwner returns (uint256) {
        uint256 tokenId = nextHouseId;
        _mint(recipient, tokenId);
        houses[tokenId] = House(recipient, 0, 0, false);
        nextHouseId++;
        return tokenId;
    }

    function listHouse(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "not owner");
        require(price > 0, "price must be greater than 0");

        houses[tokenId].price = price;
        houses[tokenId].listedTimestamp = block.timestamp;
        houses[tokenId].isListed = true;

        emit HouseListed(tokenId, price, msg.sender);
    }

    function buyHouse(uint256 tokenId) external payable {
        require(houses[tokenId].isListed, "house not listed");
        uint256 price = houses[tokenId].price;
        require(msg.value >= price, "not enough money");

        address seller = houses[tokenId].owner;
        require(seller != msg.sender, "cannot buy your own house");

        uint256 listingDuration = block.timestamp -
            houses[tokenId].listedTimestamp;
        uint256 fee = (listingDuration * price * feeRate) / 1000;
        uint256 sellerAmount = price - fee;

        _transfer(seller, msg.sender, tokenId);

        houses[tokenId].isListed = false;
        houses[tokenId].owner = msg.sender;
        houses[tokenId].listedTimestamp = 0;

        payable(seller).transfer(sellerAmount);
        payable(feeRecipient).transfer(fee);

        emit HouseSold(tokenId, msg.sender, price);
    }

    // 获取指定用户的房屋列表
    function getUserHouses(
        address user
    ) external view returns (uint256[] memory) {
        uint256 totalSupply = totalSupply();
        uint256[] memory userHouses = new uint256[](nextHouseId);
        uint256 counter = 0;

        for (uint256 i = 0; i < totalSupply; i++) {
            if (houses[i].owner == user) {
                userHouses[counter] = i;
                counter++;
            }
        }
        return userHouses;
    }

    // 获取所有在售房屋列表
    function getListedHouses() external view returns (uint256[] memory) {
        uint256 totalSupply = totalSupply();
        uint256 listedCount = 0;

        // 首先计算有多少房屋在销售
        for (uint256 i = 0; i < totalSupply; i++) {
            if (houses[i].isListed) {
                listedCount++;
            }
        }

        // 创建一个数组存储在售房屋
        uint256[] memory listedHouses = new uint256[](listedCount);
        uint256 counter = 0;

        for (uint256 i = 0; i < totalSupply; i++) {
            if (houses[i].isListed) {
                listedHouses[counter] = i;
                counter++;
            }
        }
        return listedHouses;
    }

    function getHouseDetails(
        uint256 tokenId
    ) external view returns (address, uint256, uint256, bool) {
        House memory house = houses[tokenId];
        return (
            house.owner,
            house.listedTimestamp,
            house.price,
            house.isListed
        );
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }

    function setFeeRate(uint256 _feeRate) external onlyOwner {
        feeRate = _feeRate;
    }
}
