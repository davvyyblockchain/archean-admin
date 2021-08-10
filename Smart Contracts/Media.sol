pragma solidity ^0.8.0;

import "./New_ERC1155Mintable.sol";
import "./IMedia.sol";
import "./IMarket.sol";
import "./ERC721MinterCreator.sol";

contract Media is IMedia {
    address private _ERC1155Address;
    address private _marketAddress;
    address private _ERC721Address;

    uint256 private _tokenCounter;

    // TokenHash => tokenID
    mapping(bytes32 => uint256) private _tokenHashToTokenID;

    // tokenID => Owner
    mapping(uint256 => address) nftToOwners;

    // tokenID => Creator
    mapping(uint256 => address) nftToCreators;

    // tokenID => Token
    mapping(uint256 => Token) tokenIDToToken;

    modifier whenTokenExist(uint256 _tokenID) {
        require(
            tokenIDToToken[_tokenID]._creator != address(0),
            "Media: The Token Doesn't Exist!"
        );
        _;
    }

    constructor(
        address _ERC1155,
        address _ERC721,
        address _market
    ) {
        require(_ERC1155 != address(0), "Media: Invalid Address!");
        require(_ERC721 != address(0), "Media: Invalid Address!");
        require(_market != address(0), "Media: Invalid Address!");

        _ERC1155Address = _ERC1155;
        _ERC721Address = _ERC721;
        _marketAddress = _market;
    }

    event TokenCounter(uint256);

    function mintToken(
        bool _isFungible,
        string calldata uri,
        string calldata title,
        uint256 totalSupply,
        uint8 royaltyPoints,
        address[] memory collaborators,
        uint8[] calldata percentages
    ) external payable override returns (uint256) {
        require(msg.value != 0, "Media: No Commission Amount Provided!");

        // Calculate hash of the Token
        bytes32 tokenHash = keccak256(
            abi.encodePacked(uri, title, totalSupply)
        );

        // Check if Token with same data exists
        require(
            _tokenHashToTokenID[tokenHash] == 0,
            "Media: Token With Same Data Already Exist!"
        );

        _tokenCounter++;

        // Store the hash
        _tokenHashToTokenID[tokenHash] = _tokenCounter;

        if (_isFungible) {
            ERC1155Mintable(_ERC1155Address).mint(
                _tokenCounter,
                msg.sender,
                totalSupply
            );
        } else {
            ERC721Create(_ERC721Address).mint(_tokenCounter, msg.sender);

            nftToOwners[_tokenCounter] = msg.sender;
        }

        nftToCreators[_tokenCounter] = msg.sender;

        Token memory newToken = Token(
            _tokenCounter,
            msg.sender,
            msg.sender,
            uri,
            title,
            _isFungible
        );

        if (_isFungible) {
            newToken._currentOwner = address(0);
        }

        IMarket.Collaborators memory newTokenColab = IMarket.Collaborators(
            collaborators,
            percentages
        );

        IMarket(_marketAddress).setCollaborators(_tokenCounter, newTokenColab);
        IMarket(_marketAddress).setRoyaltyPoints(_tokenCounter, royaltyPoints);

        tokenIDToToken[_tokenCounter] = newToken;

        // Transfer the admin commission
        payable(_marketAddress).transfer(msg.value);
        // Set Admin Points
        IMarket(_marketAddress).addAdminCommission(msg.value);

        emit MintToken(
            _isFungible,
            uri,
            title,
            totalSupply,
            royaltyPoints,
            collaborators,
            percentages
        );

        emit TokenCounter(_tokenCounter);

        return _tokenCounter;
    }

    /**
     * @notice This method is used to Get Token of _tokenID
     *
     * @param _tokenID TokenID of the Token to get
     *
     * @return Token The Token
     */
    function getToken(uint256 _tokenID)
        public
        view
        override
        whenTokenExist(_tokenID)
        returns (Token memory)
    {
        return tokenIDToToken[_tokenID];
    }

    function getTotalNumberOfNFT() external view returns (uint256) {
        return _tokenCounter;
    }

    function bid(
        uint256 _tokenID,
        uint256 _amount,
        address _owner
    ) external payable override whenTokenExist(_tokenID) returns (bool) {
        require(msg.value != 0, "Media: You Can't Bid With 0 Amount!");
        require(
            tokenIDToToken[_tokenID]._currentOwner != msg.sender,
            "Media: The Token Owner Can't Bid!"
        );
        require(
            msg.sender != _owner,
            "Media: You Cannot Bid For Your Own Token!"
        );

        Token memory token = tokenIDToToken[_tokenID];
        if (token._isFungible) {
            require(
                ERC1155Mintable(_ERC1155Address).balanceOf(_owner, _tokenID) >=
                    _amount,
                "Media: The Owner Does Not Have That Much Tokens!"
            );
        } else {
            require(_amount == 1, "Media: Only 1 Token Is Available");
            require(
                nftToOwners[_tokenID] == _owner,
                "Media: Invalid Owner Provided!"
            );
        }

        payable(_marketAddress).transfer(msg.value);
        // amount, tokenOwner
        IMarket(_marketAddress).bid(
            _tokenID,
            msg.sender,
            msg.value,
            _amount,
            _owner
        );

        return true;
    }

    function cancelBid(uint256 _tokenID, address _owner)
        external
        override
        whenTokenExist(_tokenID)
        returns (bool)
    {
        IMarket(_marketAddress).cancelBid(_tokenID, msg.sender, _owner);
        return true;
    }

    function rejectBid(uint256 _tokenID, address _bidder)
        external
        override
        whenTokenExist(_tokenID)
        returns (bool)
    {
        Token memory token = tokenIDToToken[_tokenID];
        if (token._isFungible) {
            require(
                ERC1155Mintable(_ERC1155Address).balanceOf(
                    msg.sender,
                    _tokenID
                ) >= 0,
                "Media: Only Owner Can Reject Bid!"
            );
        } else {
            require(
                nftToOwners[_tokenID] == msg.sender,
                "Media: Only Owner Can Reject Bid!"
            );
        }
        // require(msg.sender == nftToOwners[_tokenID], "Media: Only Owner Can Reject Bid!");
        IMarket(_marketAddress).cancelBid(_tokenID, _bidder, msg.sender);
        return true;
    }

    function acceptBid(
        uint256 _tokenID,
        address _bidder,
        uint256 _amount
    ) external override whenTokenExist(_tokenID) returns (bool) {
        Token memory token = tokenIDToToken[_tokenID];
        if (token._isFungible) {
            require(
                ERC1155Mintable(_ERC1155Address).balanceOf(
                    msg.sender,
                    _tokenID
                ) >= _amount,
                "Media: You Don't have The Tokens!"
            );
        } else {
            require(
                nftToOwners[_tokenID] == msg.sender,
                "Media: Only Owner Can Accept Bid!"
            );
        }
        IMarket(_marketAddress).acceptBid(
            _tokenID,
            msg.sender,
            _bidder,
            _amount
        );

        _transfer(_tokenID, msg.sender, _bidder, _amount);

        nftToOwners[_tokenID] = _bidder;
        return true;
    }

    function setAdminAddress(address _adminAddress) external returns (bool) {
        IMarket(_marketAddress).setAdminAddress(_adminAddress);
        return true;
    }

    function getAdminCommissionPercentage() external view returns (uint256) {
        return IMarket(_marketAddress).getCommissionPercentage();
    }

    function setCommissionPecentage(uint8 _newCommissionPercentage)
        external
        returns (bool)
    {
        require(
            msg.sender == IMarket(_marketAddress).getAdminAddress(),
            "Media: Only Admin Can Set Commission Percentage!"
        );
        require(
            _newCommissionPercentage > 0,
            "Media: Invalid Commission Percentage"
        );
        require(
            _newCommissionPercentage <= 100,
            "Media: Commission Percentage Must Be Less Than 100!"
        );

        IMarket(_marketAddress).setCommissionPecentage(
            _newCommissionPercentage
        );
        return true;
    }

    function buyNow(
        uint256 _tokenID,
        address _owner,
        address _recipient,
        uint256 _amount
    ) external payable override whenTokenExist(_tokenID) returns (bool) {
        require(msg.value != 0, "Media: You Can't Buy Token With 0 Amount!");
        require(_owner != _recipient, "Media: You Can't Buy Your Token!");
        require(
            tokenIDToToken[_tokenID]._currentOwner != _recipient,
            "Media: The Token Owner Can't Buy!"
        );

        Token memory token = tokenIDToToken[_tokenID];
        if (token._isFungible) {
            require(
                ERC1155Mintable(_ERC1155Address).balanceOf(_owner, _tokenID) >=
                    _amount,
                "Media: The Owner Does Not Have That Much Tokens!"
            );
        } else {
            require(_amount == 1, "Media: Only 1 Token Is Available");
            require(
                nftToOwners[_tokenID] == _owner,
                "Media: Invalid Owner Provided!"
            );
        }

        payable(_marketAddress).transfer(msg.value);

        _transfer(_tokenID, _owner, _recipient, _amount);

        IMarket(_marketAddress).divideMoney(_tokenID, _owner, msg.value);

        return true;
    }

    /**
     * @dev See {IMedia}
     */
    function transfer(
        uint256 _tokenID,
        address _recipient,
        uint256 _amount
    ) external override whenTokenExist(_tokenID) returns (bool) {
        Token memory token = tokenIDToToken[_tokenID];
        if (token._isFungible) {
            require(
                ERC1155Mintable(_ERC1155Address).balanceOf(
                    msg.sender,
                    _tokenID
                ) >= _amount,
                "Media: You Don't have The Tokens!"
            );
        } else {
            require(
                nftToOwners[_tokenID] == msg.sender,
                "Media: Only Owner Can Transfer!"
            );
        }

        _transfer(_tokenID, msg.sender, _recipient, _amount);
        return true;
    }

    function _transfer(
        uint256 _tokenID,
        address _owner,
        address _recipient,
        uint256 _amount
    ) internal {
        if (tokenIDToToken[_tokenID]._isFungible) {
            ERC1155Mintable(_ERC1155Address).transferFrom(
                _owner,
                _recipient,
                _tokenID,
                _amount,
                msg.sender
            );
        } else {
            ERC721Create(_ERC721Address).TransferFrom(
                _owner,
                _recipient,
                _tokenID,
                msg.sender
            );
            tokenIDToToken[_tokenID]._currentOwner = _recipient;
            nftToOwners[_tokenID] = _recipient;
        }

        emit Transfer(_tokenID, _owner, _recipient, _amount);
    }

    /**
     * @notice This method is used to redeem points
     *
     * @param _amount Amount of points to redeem
     *
     * @return bool Transaction status
     */
    function redeemPoints(uint256 _amount) external override returns (bool) {
        require(_amount > 0, "Media: Cannot Redeem 0 Amount");
        IMarket(_marketAddress).redeemPoints(msg.sender, _amount);
        return true;
    }

    /**
     * @dev See {IMedia}
     */
    function getUsersRedeemablePoints()
        external
        view
        override
        returns (uint256)
    {
        return IMarket(_marketAddress).getUsersRedeemablePoints(msg.sender);
    }
}
