pragma solidity ^0.8.0;

interface IMedia {
    struct Token {
        uint256 _tokenID;
        address _creator;
        address _currentOwner;
        string _uri;
        string _title;
        bool _isFungible;
    }

    event MintToken(
        bool _isFungible,
        string uri,
        string title,
        uint256 totalSupply,
        uint8 royaltyPoints,
        address[] collaborators,
        uint8[] percentages
    );

    event Transfer(
        uint256 _tokenID,
        address _owner,
        address _recipient,
        uint256 _amount
    );

    /**
     * @notice This method is used to Mint a new Token
     *
     * @return uint256 Token Id of the Minted Token
     */
    function mintToken(
        bool _isFungible,
        string calldata uri,
        string calldata title,
        uint256 totalSupply,
        uint8 royaltyPoints,
        address[] calldata collaborators,
        uint8[] calldata percentages
    ) external payable returns (uint256);

    /**
     * @notice This method is used to get details of the Token with ID _tokenID
     *
     * @param _tokenID TokenID of the Token to get details of
     *
     * @return Token Structure of the Token
     */
    function getToken(uint256 _tokenID) external view returns (Token memory);

    /**
     * @notice This method is used to bid for the Token with ID _tokenID
     *
     * @param _tokenID TokenID of the Token to Bid for
     *
     * @return bool Transaction status
     */
    function bid(
        uint256 _tokenID,
        uint256 _amount,
        address _owner
    ) external payable returns (bool);

    /**
     * @notice This method is used to cancel bid for the Token with ID _tokenID
     *
     * @param _tokenID TokenID of the Token to cancel Bid for
     *
     * @return bool Transaction status
     */
    function cancelBid(uint256 _tokenID, address _owner)
        external
        returns (bool);

    /**
     * @notice This method is used to Reject bid for the Token with ID _tokenID and Bid of bidder with address _bidder
     *
     * @param _tokenID TokenID of the Token to Reject Bid for
     * @param _bidder Address of the Bidder to Reject Bid of
     *
     * @return bool Transaction status
     */
    function rejectBid(uint256 _tokenID, address _bidder)
        external
        returns (bool);

    /**
     * @notice This method is used to Accept the bid for the Token with ID _tokenID
     *
     * @param _tokenID TokenID of the Token to Accept Bid For
     * @param _bidder Address of the Bidder
     * @param _amount Number of tokens to be transferred to the Bidder - in case of ERC1155 Token
     *
     * @return bool Transaction status
     */
    function acceptBid(
        uint256 _tokenID,
        address _bidder,
        uint256 _amount
    ) external returns (bool);

    /**
     * @notice This method is used to Buy Token with ID _tokenID
     *
     * @param _tokenID TokenID of the Token to Buy
     * @param _owner Address of the Owner of the Token
     * @param _recipient Address of the recipient
     * @param _amount Number of tokens to be transferred to the recipient - in case of ERC1155 Token
     *
     * @return bool Transaction status
     */
    function buyNow(
        uint256 _tokenID,
        address _owner,
        address _recipient,
        uint256 _amount
    ) external payable returns (bool);

    /**
     * @notice This method is used to Transfer Token
     *
     * @dev This method is used when Owner Wants to directly transfer Token
     *
     * @param _tokenID Token ID of the Token To Transfer
     * @param _recipient Receiver of the Token
     * @param _amount Number of Tokens To Transfer, In Case of ERC1155 Token
     *
     * @return bool Transaction status
     */
    function transfer(
        uint256 _tokenID,
        address _recipient,
        uint256 _amount
    ) external returns (bool);

    /**
     * @notice This method is used to Redeem points
     *
     * @param _amount Amount Points to Redeem
     *
     * @return bool Transaction status
     */
    function redeemPoints(uint256 _amount) external returns (bool);

    /**
     * @notice This Method is used to get Redeemable Points of the caller
     *
     * @return uint Redeemable Points
     */
    function getUsersRedeemablePoints() external view returns (uint256);
}
