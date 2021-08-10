pragma solidity ^0.8.0;

import "./ERC1155.sol";

contract ERC1155Mintable is ERC1155 {
    address private _mediaContract;

    modifier onlyMediaCaller {
        require(
            msg.sender == _mediaContract,
            "ERC1155Mintable: Unauthorized Access!"
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

    function mint(
        uint256 _tokenID,
        address _owner,
        uint256 totalSupply
    ) external onlyMediaCaller {
        balances[_tokenID][_owner] = totalSupply;
    }

    /**
     * @notice This Method is used to Transfer Token
     * @dev This method is used while Direct Buy-Sell takes place
     *
     * @param _from Address of the Token Owner to transfer from
     * @param _to Address of the Token receiver
     * @param _tokenID TokenID of the Token to transfer
     * @param _amount Amount of Tokens to transfer, in case of Fungible Token transfer
     *
     * @return bool Transaction Status
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenID,
        uint256 _amount,
        address _msgSender
    ) external onlyMediaCaller returns (bool) {
        require(_to != address(0x0), "ERC1155Mintable: _to must be non-zero.");

        // require(
        //     _from == _msgSender || operatorApproval[_from][_msgSender] == true,
        //     "ERC1155Mintable: Need operator approval for 3rd party transfers."
        // );

        safeTransferFrom(_from, _to, _tokenID, _amount, "");

        return true;
    }
}
