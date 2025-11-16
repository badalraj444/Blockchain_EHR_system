// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./registry.sol";
// import "./NotificationManager.sol"; // ignore notifications for now

contract Metadata {
    Registry public registry;
    // NotificationManager public notificationManager;

    struct EHRData {
        string dataType;
        string HI;   // CID or human identifier stored as string
        bytes encKey; // encrypted AES key as bytes
    }

    mapping(bytes32 => EHRData[]) public Data;

    event EHRDataAdded(bytes32 indexed ownerKey, uint256 index, string dataType, string HI);

    constructor(address _registryAddress) {
        registry = Registry(_registryAddress);
    }

    function addEHRdata(
        bytes32 ownerKey,
        string memory dataType,
        string memory HI,
        bytes memory encKey
    ) public {
        require(registry.checkUser(ownerKey), "Patient/new-owner not registered to system!");
        require(registry.getOwner(ownerKey) == msg.sender, "Not owner/unauthorized");

        Data[ownerKey].push(EHRData(dataType, HI, encKey));
        uint256 index = Data[ownerKey].length - 1;
        emit EHRDataAdded(ownerKey, index, dataType, HI);
    }

    function searchData(bytes32 userKey) public view returns (string[] memory, string[] memory, bytes[] memory) {
        require(registry.checkUser(userKey), "User not registered to system!");

        uint256 length = Data[userKey].length;
        string[] memory dataTypes = new string[](length);
        string[] memory HIList = new string[](length);
        bytes[] memory encKeys = new bytes[](length);

        for (uint256 i = 0; i < length; i++) {
            dataTypes[i] = Data[userKey][i].dataType;
            HIList[i] = Data[userKey][i].HI;
            encKeys[i] = Data[userKey][i].encKey;
        }

        return (dataTypes, HIList, encKeys);
    }
}
