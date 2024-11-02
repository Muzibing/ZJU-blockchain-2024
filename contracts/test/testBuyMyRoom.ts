import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Test", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const BuyMyRoom = await ethers.getContractFactory("BuyMyRoom");
    const buyMyRoom = await BuyMyRoom.deploy();

    return { buyMyRoom, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should return hello world", async function () {
      const { buyMyRoom } = await loadFixture(deployFixture);
      expect(await buyMyRoom.helloworld()).to.equal("hello world");
    });
  });
});

describe("BuyMyRoom Contract", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const BuyMyRoom = await ethers.getContractFactory("BuyMyRoom");
    const buyMyRoom = await BuyMyRoom.deploy();
    return { buyMyRoom, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should return hello world", async function () {
      const { buyMyRoom } = await loadFixture(deployFixture);
      expect(await buyMyRoom.helloworld()).to.equal("hello world");
    });
  });

  describe("Minting Houses", function () {
    it("Should allow owner to mint a house", async function () {
      const { buyMyRoom, owner } = await loadFixture(deployFixture);
      await buyMyRoom.mintHouse(owner.address);
      expect(await buyMyRoom.ownerOf(0)).to.equal(owner.address);
    });
  });

  describe("Listing Houses", function () {
    it("Should allow owner to list a house", async function () {
      const { buyMyRoom, owner } = await loadFixture(deployFixture);
      await buyMyRoom.mintHouse(owner.address);
      await buyMyRoom.listHouse(0, ethers.utils.parseEther("1"));
      const houseDetails = await buyMyRoom.getHouseDetails(0);
      expect(houseDetails.isListed).to.be.true;
      expect(houseDetails.price).to.equal(ethers.utils.parseEther("1"));
    });

    it("Should revert if not the owner tries to list", async function () {
      const { buyMyRoom, owner, otherAccount } = await loadFixture(deployFixture);
      await buyMyRoom.mintHouse(owner.address);
      await expect(buyMyRoom.connect(otherAccount).listHouse(0, ethers.utils.parseEther("1"))).to.be.revertedWith("not owner");
    });
  });

  describe("Buying Houses", function () {
    it("Should allow someone to buy a listed house", async function () {
      const { buyMyRoom, owner, otherAccount } = await loadFixture(deployFixture);
      await buyMyRoom.mintHouse(owner.address);
      await buyMyRoom.listHouse(0, ethers.utils.parseEther("1"));
      await expect(buyMyRoom.connect(otherAccount).buyHouse(0, { value: ethers.utils.parseEther("1") })).to.changeEtherBalances(
        [owner, otherAccount],
        [ethers.utils.parseEther("1").mul(-1), ethers.utils.parseEther("1")]
      );
      expect(await buyMyRoom.ownerOf(0)).to.equal(otherAccount.address);
    });

    it("Should revert if buying an unlisted house", async function () {
      const { buyMyRoom, owner, otherAccount } = await loadFixture(deployFixture);
      await buyMyRoom.mintHouse(owner.address);
      await expect(buyMyRoom.connect(otherAccount).buyHouse(0, { value: ethers.utils.parseEther("1") })).to.be.revertedWith("house not listed");
    });
  });
});
