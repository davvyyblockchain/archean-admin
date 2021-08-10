pragma solidity ^0.8.0;

import "./IMarket.sol";
import "./SafeMath.sol";

contract Market is IMarket {
    using SafeMath for uint256;

    address private _mediaContract;
    address private _adminAddress;

    // To store commission amount of admin
    uint256 private _adminPoints;
    // To storre commission percentage for each mint
    uint8 private _adminCommissionPercentage;

    // tokenID => (bidderAddress => BidAmount)
    mapping(uint256 => mapping(address => uint256)) private tokenBids;

    // bidderAddress => its Total Bid amount
    mapping(address => uint256) private userTotalBids;

    // userAddress => its Redeem points
    mapping(address => uint256) private userRedeemPoints;

    // tokenID => List of Transactions
    mapping(uint256 => string[]) private tokenTransactionHistory;

    // tokenID => creator's Royalty Percentage
    mapping(uint256 => uint8) private tokenRoyaltyPercentage;

    // tokenID => { collaboratorsAddresses[] , percentages[] }
    mapping(uint256 => Collaborators) private tokenCollaborators;

    // tokenID => all Bidders
    mapping(uint256 => address[]) private tokenBidders;

    modifier onlyMediaCaller {
        require(msg.sender == _mediaContract, "Market: Unauthorized Access!");
        _;
    }

    // New Code -----------

    struct NewBid {
        uint256 _amount;
        uint256 _bidAmount;
    }

    // tokenID => owner => bidder => Bid Struct
    mapping(uint256 => mapping(address => mapping(address => NewBid)))
        private _newTokenBids;

    // tokenID => owner => all bidders
    mapping(uint256 => mapping(address => address[])) private newTokenBidders;

    // -------------------

    fallback() external {}

    receive() external payable {}

    /**
     * @notice This method is used to Set Media Contract's Address
     *
     * @param _mediaContractAddress Address of the Media Contract to set
     */
    function configureMedia(address _mediaContractAddress) external {
        // TODO: Only Owner Modifier
        require(
            _mediaContractAddress != address(0),
            "Market: Invalid Media Contract Address!"
        );
        require(
            _mediaContract == address(0),
            "Market: Media Contract Alredy Configured!"
        );

        _mediaContract = _mediaContractAddress;
    }

    /**
     * @dev See {IMarket}
     */
    function setCollaborators(
        uint256 _tokenID,
        Collaborators calldata _collaborators
    ) external override onlyMediaCaller {
        tokenCollaborators[_tokenID] = _collaborators;
    }

    /**
     * @dev See {IMarket}
     */
    function setRoyaltyPoints(uint256 _tokenID, uint8 _royaltyPoints)
        external
        override
        onlyMediaCaller
    {
        tokenRoyaltyPercentage[_tokenID] = _royaltyPoints;
    }

    /**
     * @dev See {IMarket}
     */
    function bid(
        uint256 _tokenID,
        address _bidder,
        uint256 _bidAmount,
        uint256 _amount, // New Param for Token Quantity
        address _tokenOwner // New Param for Token Owner
    ) external override onlyMediaCaller returns (bool) {
        // require(_bidAmount != 0, "Market: You Can't Bid With 0 Amount!");

        // // Minus the Previous bid, if any, else 0
        // userTotalBids[_bidder] = userTotalBids[_bidder].sub(
        //     tokenBids[_tokenID][_bidder]
        // );

        // // Set Bid for the Token
        // tokenBids[_tokenID][_bidder] = _bidAmount;

        // // Push The bidder in all bidder array
        // tokenBidders[_tokenID].push(_bidder);

        // // Add New bid
        // userTotalBids[_bidder] = userTotalBids[_bidder].add(_bidAmount);

        // // Add Redeem points for the user
        // userRedeemPoints[_bidder] = userRedeemPoints[_bidder].add(_bidAmount);

        // emit Bid(_tokenID, _bidder, _bidAmount);

        // return true;

        // New Code

        require(_amount != 0, "Market: You Can't Bid For 0 Tokens");
        require(!(_amount < 0), "Market: You Can't Bid For Negative Tokens");

        // require(_newTokenBids[_tokenID][_tokenOwner][_bidder]._amount != _amount &&
        //         _newTokenBids[_tokenID][_tokenOwner][_bidder]._bidAmount != _bidAmount,
        //         "Market: You Already Have Bid For Same Quantity and Same Amount");

        if (_newTokenBids[_tokenID][_tokenOwner][_bidder]._amount == _amount)
            if (
                _newTokenBids[_tokenID][_tokenOwner][_bidder]._bidAmount ==
                _bidAmount
            )
                revert(
                    "Market: You Already Have Bid For Same Quantity and Same Amount"
                );

        // Minus the Previous bid, if any, else 0
        userTotalBids[_bidder] = userTotalBids[_bidder].sub(
            _newTokenBids[_tokenID][_tokenOwner][_bidder]._bidAmount
        );

        bool doesBidderHasBid = false;
        for (
            uint8 index = 0;
            index < newTokenBidders[_tokenID][_tokenOwner].length;
            index++
        ) {
            if (newTokenBidders[_tokenID][_tokenOwner][index] == _bidder) {
                doesBidderHasBid = true;
                break;
            }
        }

        if (!doesBidderHasBid) {
            // Push The bidder in all bidder array
            newTokenBidders[_tokenID][_tokenOwner].push(_bidder);
        }

        // Set Bid for the Token
        NewBid memory newBid = NewBid(_amount, _bidAmount);
        _newTokenBids[_tokenID][_tokenOwner][_bidder] = newBid;

        // Add New bid
        userTotalBids[_bidder] = userTotalBids[_bidder].add(_bidAmount);

        // Add Redeem points for the user
        userRedeemPoints[_bidder] = userRedeemPoints[_bidder].add(_bidAmount);

        emit Bid(_tokenID, _bidder, _bidAmount);

        return true;
    }

    /**
     * @dev See {IMarket}
     */
    function acceptBid(
        uint256 _tokenID,
        address _owner,
        address _bidder,
        uint256 _amount
    ) external override returns (bool) {
        // // require(msg.sender == ownerOf(_tokenID), "ERC1155Creator: Only Owner Can Appect Bid!");
        // require(
        //     tokenBids[_tokenID][_bidder] != 0,
        //     "ERC1155Creator: The Specified Bidder Has No bids For The Token!"
        // );

        // // _transferFrom(msg.sender, _bidder, _tokenID, _amount);

        // // Divide the points
        // divideMoney(_tokenID, _owner, tokenBids[_tokenID][_bidder]);

        // // Minus User's Redeemable Points
        // userRedeemPoints[_bidder] = userRedeemPoints[_bidder].sub(
        //     tokenBids[_tokenID][_bidder]
        // );

        // // Remove All The bids for the Token
        // for (uint256 index; index < tokenBidders[_tokenID].length; index++) {
        //     userTotalBids[tokenBidders[_tokenID][index]] = userTotalBids[
        //         tokenBidders[_tokenID][index]
        //     ]
        //         .sub(tokenBids[_tokenID][tokenBidders[_tokenID][index]]);
        //     delete tokenBids[_tokenID][tokenBidders[_tokenID][index]];
        // }

        // // Remove All Bidders from the list
        // delete tokenBidders[_tokenID];

        // emit AcceptBid(
        //     _tokenID,
        //     _owner,
        //     _amount,
        //     _bidder,
        //     tokenBids[_tokenID][_bidder]
        // );

        // return true;

        // New Code -------------------
        // require(msg.sender == ownerOf(_tokenID), "ERC1155Creator: Only Owner Can Appect Bid!");
        require(
            _newTokenBids[_tokenID][_owner][_bidder]._bidAmount != 0,
            "Market: The Specified Bidder Has No bids For The Token!"
        );
        require(
            _newTokenBids[_tokenID][_owner][_bidder]._amount == _amount,
            "Market: The Bidder Has Not Bid For The Specified Amount Of Tokens!"
        );

        // Divide the points
        divideMoney(
            _tokenID,
            _owner,
            _newTokenBids[_tokenID][_owner][_bidder]._bidAmount
        );

        // Minus Bidder's Redeemable Points
        userRedeemPoints[_bidder] = userRedeemPoints[_bidder].sub(
            _newTokenBids[_tokenID][_owner][_bidder]._bidAmount
        );

        // Remove All The bids for the Token
        for (
            uint256 index;
            index < newTokenBidders[_tokenID][_owner].length;
            index++
        ) {
            userTotalBids[
                newTokenBidders[_tokenID][_owner][index]
            ] = userTotalBids[newTokenBidders[_tokenID][_owner][index]].sub(
                _newTokenBids[_tokenID][_owner][
                    newTokenBidders[_tokenID][_owner][index]
                ]
                ._bidAmount
            );
            delete _newTokenBids[_tokenID][_owner][
                newTokenBidders[_tokenID][_owner][index]
            ];
        }

        // Remove All Bidders from the list
        delete newTokenBidders[_tokenID][_owner];

        emit AcceptBid(
            _tokenID,
            _owner,
            _amount,
            _bidder,
            _newTokenBids[_tokenID][_owner][_bidder]._bidAmount
        );

        return true;
    }

    /**
     * @dev See {IMarket}
     */
    function cancelBid(
        uint256 _tokenID,
        address _bidder,
        address _owner
    ) external override onlyMediaCaller returns (bool) {
        // require(
        //     userTotalBids[_bidder] != 0,
        //     "Market: You Have Not Set Any Bid Yet!"
        // );
        // require(
        //     tokenBids[_tokenID][_bidder] != 0,
        //     "Market: You Have Not Bid For This Token."
        // );

        // // Minus from User's Total Bids
        // userTotalBids[_bidder] = userTotalBids[_bidder].sub(
        //     tokenBids[_tokenID][_bidder]
        // );

        // // Delete the User's Bid
        // delete tokenBids[_tokenID][_bidder];

        // // Remove Bidder from Token's Bidders' list
        // removeBidder(_tokenID, _bidder);

        // emit CancelBid(_tokenID, _bidder);

        // return true;

        // New Code -------------------
        require(
            userTotalBids[_bidder] != 0,
            "Market: You Have Not Set Any Bid Yet!"
        );
        require(
            _newTokenBids[_tokenID][_owner][_bidder]._bidAmount != 0,
            "Market: You Have Not Bid For This Token."
        );

        // Minus from Bidder's Total Bids
        userTotalBids[_bidder] = userTotalBids[_bidder].sub(
            _newTokenBids[_tokenID][_owner][_bidder]._bidAmount
        );

        // Delete the User's Bid
        delete _newTokenBids[_tokenID][_owner][_bidder];

        // Remove Bidder from Token's Bidders' list
        removeBidder(_tokenID, _bidder, _owner);

        emit CancelBid(_tokenID, _bidder);

        return true;
    }

    /**
     * @dev This internal method is used to remove the Bidder's address who has canceled bid from Bidders' list, for the Token with ID _tokenID
     *
     * @param _tokenID TokenID of the Token to remove bidder of
     * @param _bidder Address of the Bidder to remove
     */
    function removeBidder(
        uint256 _tokenID,
        address _bidder,
        address _owner
    ) internal {
        for (
            uint256 index = 0;
            index < newTokenBidders[_tokenID][_owner].length;
            index++
        ) {
            if (newTokenBidders[_tokenID][_owner][index] == _bidder) {
                newTokenBidders[_tokenID][_owner][index] = newTokenBidders[
                    _tokenID
                ][_owner][newTokenBidders[_tokenID][_owner].length - 1];
                newTokenBidders[_tokenID][_owner].pop();
                break;
            }
        }
    }

    /**
     * @dev See {IMarket}
     */
    function setAdminAddress(address _newAdminAddress)
        external
        override
        onlyMediaCaller
        returns (bool)
    {
        require(
            _newAdminAddress != address(0),
            "Market: Invalid Admin Address!"
        );
        require(
            _adminAddress == address(0),
            "Market: Admin Already Configured!"
        );

        _adminAddress = _newAdminAddress;
        return true;
    }

    /**
     * @dev See {IMarket}
     */
    function getAdminAddress()
        external
        view
        override
        onlyMediaCaller
        returns (address)
    {
        return _adminAddress;
    }

    /**
     * @dev See {IMarket}
     */
    function setCommissionPecentage(uint8 _commissionPercentage)
        external
        override
        onlyMediaCaller
        returns (bool)
    {
        _adminCommissionPercentage = _commissionPercentage;
        return true;
    }

    /**
     * @dev See {IMarket}
     */
    function getCommissionPercentage()
        external
        view
        override
        onlyMediaCaller
        returns (uint8)
    {
        return _adminCommissionPercentage;
    }

    // TODO: To be removed
    function getMarketBalance() external view returns (uint256) {
        return payable(this).balance;
    }

    /**
     * @dev See {IMarket}
     */
    function divideMoney(
        uint256 _tokenID,
        address _owner,
        uint256 _amountToDivide
    ) public override returns (bool) {
        require(_amountToDivide > 0, "Market: Amount To Divide Can't Be 0!");

        // If no royalty points have been set, transfer the amount to the owner
        if (tokenRoyaltyPercentage[_tokenID] == 0) {
            userRedeemPoints[_owner] = userRedeemPoints[_owner].add(
                _amountToDivide
            );
            return true;
        }

        // Amount to divide among Collaborators
        uint256 royaltyPoints = _amountToDivide
        .mul(tokenRoyaltyPercentage[_tokenID])
        .div(100);

        Collaborators memory tokenColab = tokenCollaborators[_tokenID];

        uint256 amountToTransfer;
        uint256 totalAmountTransferred;

        for (
            uint256 index = 0;
            index < tokenColab._collaborators.length;
            index++
        ) {
            // Individual Collaborator's share Amount
            amountToTransfer = royaltyPoints
            .mul(tokenColab._percentages[index])
            .div(100);

            // Total Amount Transferred
            totalAmountTransferred = totalAmountTransferred.add(
                amountToTransfer
            );

            // Add Collaborator's Redeem points
            userRedeemPoints[
                tokenColab._collaborators[index]
            ] = userRedeemPoints[tokenColab._collaborators[index]].add(
                amountToTransfer
            );
        }

        // Add Remaining amount to Owner's redeem points
        userRedeemPoints[_owner] = userRedeemPoints[_owner].add(
            _amountToDivide.sub(royaltyPoints)
        );

        totalAmountTransferred = totalAmountTransferred.add(
            _amountToDivide.sub(royaltyPoints)
        );

        // Check for Transfer amount error
        require(
            totalAmountTransferred == _amountToDivide,
            "Market: Amount Transfer Value Error!"
        );

        return true;
    }

    /**
     * @dev See {IMarket}
     */
    function addAdminCommission(uint256 _amount)
        external
        override
        onlyMediaCaller
        returns (bool)
    {
        _adminPoints = _adminPoints.add(_amount);
        return true;
    }

    /**
     * @dev See {IMarket}
     */
    function redeemPoints(address _userAddress, uint256 _amount)
        external
        override
        onlyMediaCaller
        returns (bool)
    {
        // Admin's points
        if (_userAddress == _adminAddress) {
            require(
                _adminPoints >= _amount,
                "Market: You Don't have that much points to redeem!"
            );

            _adminPoints = _adminPoints.sub(_amount);
            payable(_adminAddress).transfer(_amount);
        } else {
            require(
                userRedeemPoints[_userAddress] >= _amount,
                "Market: You Don't Have That Much Points To Redeem!"
            );
            require(
                (userRedeemPoints[_userAddress] -
                    userTotalBids[_userAddress]) >= _amount,
                "Market: You Have Bids, You Can't Redeem That Much Points!"
            );

            payable(address(_userAddress)).transfer(_amount);
            userRedeemPoints[_userAddress] = userRedeemPoints[_userAddress].sub(
                _amount
            );
        }

        emit Redeem(_userAddress, _amount);
        return true;
    }

    /**
     * @dev See {IMarket}
     */
    function getUsersRedeemablePoints(address _userAddress)
        external
        view
        override
        onlyMediaCaller
        returns (uint256)
    {
        if (_userAddress == _adminAddress) {
            return _adminPoints;
        }
        return (userRedeemPoints[_userAddress] - userTotalBids[_userAddress]);
    }
}
