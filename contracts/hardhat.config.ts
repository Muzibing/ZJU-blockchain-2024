import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat:{},
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://localhost:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x9e6fcdb3ae8bfe1dae43ef81b97137923ca6c0691933267d7b25ae238381de9e',
        '0xe83f50de1094a89d520c3a68032109321436db2ee32bbb77f50e640556644b36',
        '0xd3aa5be81aa98edf3396c4ef4c810f487b40f1a55a962b235ce3de5ed4e7ce17',
        '0x99816328dbdcd9b3dc69268dd681218f001b5e08ba896e2939e54077b5e19ed4'
      ]
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;
