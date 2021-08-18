// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // URL: 'http://localhost:3000/api/v1',
  // URL: 'http://157.230.32.177:3000/api/v1',
  URL: 'https://api.decryptnft.io/api/v1',

  testNetBSC: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  mainnetBSC: 'https://bsc-dataseed1.binance.org:443',


  main: 'Mainnet',
  rops: 'Ropsten',
  rinkeby: 'Rinkeby',
  Goerli: 'Goerli',
  Kovan: 'Kovan',
  // Binance Smart Chain Main Network 
  bscMainnet: 'bsc-mainnet',
  // Binance Smart Chain Test Network 
  bscTestnet: 'bsc-testnet',

  divideValue: 1000000000000000000,

  NFTaddress:'0xfaED4a3Fe347626A36AaA268f29E5B35085CCD3d',
  NFTabi:[{ "inputs": [{ "internalType": "address", "name": "_ERC1155", "type": "address" }, { "internalType": "address", "name": "_ERC721", "type": "address" }, { "internalType": "address", "name": "_market", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "bool", "name": "_isFungible", "type": "bool" }, { "indexed": false, "internalType": "string", "name": "uri", "type": "string" }, { "indexed": false, "internalType": "string", "name": "title", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "totalSupply", "type": "uint256" }, { "indexed": false, "internalType": "uint8", "name": "royaltyPoints", "type": "uint8" }, { "indexed": false, "internalType": "address[]", "name": "collaborators", "type": "address[]" }, { "indexed": false, "internalType": "uint8[]", "name": "percentages", "type": "uint8[]" } ], "name": "MintToken", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "", "type": "uint256" }], "name": "TokenCounter", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "_tokenID", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "_owner", "type": "address" }, { "indexed": false, "internalType": "address", "name": "_recipient", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "uint256", "name": "_tokenID", "type": "uint256" }, { "internalType": "address", "name": "_bidder", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "acceptBid", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_tokenID", "type": "uint256" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "address", "name": "_owner", "type": "address" } ], "name": "bid", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_tokenID", "type": "uint256" }, { "internalType": "address", "name": "_owner", "type": "address" }, { "internalType": "address", "name": "_recipient", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "buyNow", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_tokenID", "type": "uint256" }, { "internalType": "address", "name": "_owner", "type": "address" } ], "name": "cancelBid", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getAdminCommissionPercentage", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_tokenID", "type": "uint256" }], "name": "getToken", "outputs": [{ "components": [{ "internalType": "uint256", "name": "_tokenID", "type": "uint256" }, { "internalType": "address", "name": "_creator", "type": "address" }, { "internalType": "address", "name": "_currentOwner", "type": "address" }, { "internalType": "string", "name": "_uri", "type": "string" }, { "internalType": "string", "name": "_title", "type": "string" }, { "internalType": "bool", "name": "_isFungible", "type": "bool" } ], "internalType": "struct IMedia.Token", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getTotalNumberOfNFT", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getUsersRedeemablePoints", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bool", "name": "_isFungible", "type": "bool" }, { "internalType": "string", "name": "uri", "type": "string" }, { "internalType": "string", "name": "title", "type": "string" }, { "internalType": "uint256", "name": "totalSupply", "type": "uint256" }, { "internalType": "uint8", "name": "royaltyPoints", "type": "uint8" }, { "internalType": "address[]", "name": "collaborators", "type": "address[]" }, { "internalType": "uint8[]", "name": "percentages", "type": "uint8[]" } ], "name": "mintToken", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "redeemPoints", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_tokenID", "type": "uint256" }, { "internalType": "address", "name": "_bidder", "type": "address" } ], "name": "rejectBid", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_adminAddress", "type": "address" }], "name": "setAdminAddress", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint8", "name": "_newCommissionPercentage", "type": "uint8" }], "name": "setCommissionPecentage", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_tokenID", "type": "uint256" }, { "internalType": "address", "name": "_recipient", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }],

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
