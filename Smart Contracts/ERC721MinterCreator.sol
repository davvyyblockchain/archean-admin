pragma solidity ^0.8.0;

import "./ERC721.sol";

contract ERC721Create is ERC721 {
    address private _mediaContract;

    modifier onlyMediaCaller {
        require(
            msg.sender == _mediaContract,
            "ERC721Create: Unauthorized Access!"
        );
        _;
    }

    function configureMedia(address _mediaContractAddress) external {
        // TODO: Only Owner Modifier
        require(
            _mediaContractAddress != address(0),
            "ERC1155Mintable: Invalid Media Contract Address!"
        );
        require(
            _mediaContract == address(0),
            "ERC1155Mintable: Media Contract Alredy Configured!"
        );

        _mediaContract = _mediaContractAddress;
    }

    // tokenId => Owner
    mapping(uint256 => address) nftToOwners;

    // tokenID => Creator
    mapping(uint256 => address) nftToCreators;

    uint256 private tokenCounter;

    constructor() ERC721("", "") {}

    /* 
    @notice This function is used fot minting 
     new NFT in the market.
    @dev 'msg.sender' will pass the '_tokenID' and 
     the respective NFT details.
    */
    function mint(uint256 _tokenID, address _creator)
        external
        onlyMediaCaller
        returns (bool)
    {
        nftToOwners[_tokenID] = _creator;
        nftToCreators[_tokenID] = _creator;

        _safeMint(_creator, _tokenID);

        return true;
    }

    /*
    @notice This function will transfer the Token 
     from the caller's address to the recipient address
    @dev Called the ERC721'_transfer' function to transfer 
     tokens from 'msg.sender'
    */
    function transfer(address _recipient, uint256 _tokenID)
        public
        onlyMediaCaller
        returns (bool)
    {
        require(_tokenID > 0, "ERC721Create: Token Id should be non-zero");
        transferFrom(msg.sender, _recipient, _tokenID); // ERC721 transferFrom function called
        nftToOwners[_tokenID] = _recipient;
        return true;
    }

    /*
    @notice This function will transfer from the sender account
     to the recipient account but the caller have the allowence 
     to send the Token.
    @dev check the allowence limit for msg.sender before sending
     the token
    */
    function TransferFrom(
        address _sender,
        address _recipient,
        uint256 _tokenID,
        address _msgSender
    ) public onlyMediaCaller returns (bool) {
        require(_tokenID > 0, "ERC721Create: Token Id should be non-zero");
        // require(
        //     _isApprovedOrOwner(_msgSender, _tokenID),
        //     "ERC721Create: transfer caller is neither owner nor approved"
        // );

        safeTransferFrom(_sender, _recipient, _tokenID); // ERC721 safeTransferFrom function called

        nftToOwners[_tokenID] = _recipient;
        return true;
    }
}
