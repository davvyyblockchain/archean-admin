pragma solidity ^0.8.0;

interface IMarket {
    struct Collaborators {
        address[] _collaborators;
        uint8[] _percentages;
    }

    event Bid(uint256 tokenID, address bidder, uint256 bidAmount);
    event CancelBid(uint256 tokenID, address bidder);
    event AcceptBid(
        uint256 tokenID,
        address owner,
        uint256 amount,
        address bidder,
        uint256 bidAmount
    );
    event Redeem(address userAddress, uint256 points);

    /**
     * @notice This method is used to set Collaborators to the Token
     * @param _tokenID TokenID of the Token to Set Collaborators
     * @param _collaborators Struct of Collaborators to set
     */
    function setCollaborators(
        uint256 _tokenID,
        Collaborators calldata _collaborators
    ) external;

    /**
     * @notice tHis method is used to set Royalty Points for the token
     * @param _tokenID Token ID of the token to set
     * @param _royaltyPoints Points to set
     */
    function setRoyaltyPoints(uint256 _tokenID, uint8 _royaltyPoints) external;

    /**
     * @notice this function is used to place a Bid on token
     *
     * @param _tokenID Token ID of the Token to place Bid on
     * @param _bidder Address of the Bidder
     * @param _bidAmount Amount of the Bid
     *
     * @return bool Stransaction Status
     */
    function bid(
        uint256 _tokenID,
        address _bidder,
        uint256 _bidAmount,
        uint256 _amount,
        address _tokenOwner
    ) external returns (bool);

    /**
     * @notice this function is used to Accept Bid
     *
     * @param _tokenID TokenID of the Token
     * @param _owner Address of the Owner of the Token
     * @param _bidder Address of the Bidder
     * @param _amount Bid Amount
     *
     * @return bool Transaction status
     */
    function acceptBid(
        uint256 _tokenID,
        address _owner,
        address _bidder,
        uint256 _amount
    ) external returns (bool);

    /**
     * @notice This function is used to Cancel Bid
     * @dev This methos is also used to Reject Bid
     *
     * @param _tokenID Token ID of the Token to cancel bid for
     * @param _bidder Address of the Bidder to cancel bid of
     *
     * @return bool Transaction status
     */
    function cancelBid(
        uint256 _tokenID,
        address _bidder,
        address _owner
    ) external returns (bool);

    /**
     * @notice This method is used to Divide the selling amount among Owner, Creator and Collaborators
     *
     * @param _tokenID Token ID of the Token sold
     * @param _owner Address of the Owner of the Token
     * @param _amountToDivide Amount to divide -  Selling amount of the Token
     *
     * @return bool Transaction status
     */
    function divideMoney(
        uint256 _tokenID,
        address _owner,
        uint256 _amountToDivide
    ) external returns (bool);

    /**
     * @notice This Method is used to set Commission percentage of The Admin
     *
     * @param _commissionPercentage New Commission Percentage To set
     *
     * @return bool Transaction status
     */
    function setCommissionPecentage(uint8 _commissionPercentage)
        external
        returns (bool);

    /**
     * @notice This Method is used to set Admin's Address
     *
     * @param _newAdminAddress Admin's Address To set
     *
     * @return bool Transaction status
     */
    function setAdminAddress(address _newAdminAddress) external returns (bool);

    /**
     * @notice This method is used to get Admin's Commission Percentage
     *
     * @return uint8 Commission Percentage
     */
    function getCommissionPercentage() external view returns (uint8);

    /**
     * @notice This method is used to get Admin's Address
     *
     * @return address Admin's Address
     */
    function getAdminAddress() external view returns (address);

    /**
     * @notice This method is used to give admin Commission while Minting new token
     *
     * @param _amount Commission Amount
     *
     * @return bool Transaction status
     */
    function addAdminCommission(uint256 _amount) external returns (bool);

    /**
     * @notice This method is used to Redeem Points
     *
     * @param _userAddress Address of the User to Redeem Points of
     * @param _amount Amount of points to redeem
     *
     * @return bool Transaction status
     */
    function redeemPoints(address _userAddress, uint256 _amount)
        external
        returns (bool);

    /**
     * @notice This method is used to get User's Redeemable Points
     *
     * @param _userAddress Address of the User to get Points of
     *
     * @return uint Redeemable Points
     */
    function getUsersRedeemablePoints(address _userAddress)
        external
        view
        returns (uint256);
}
