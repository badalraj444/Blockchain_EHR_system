// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Registry {
    enum Role { Patient, CareProvider, Researcher, Regulator }

    struct User {
        Role role;
        bool isRegistered;
    }

    mapping(bytes32 => User) public users;
    mapping(bytes32 => address) public ownerOf; // owner address for a user hash

    event UserRegistered(bytes32 indexed key, address indexed owner, Role role);

    function checkUser(bytes32 pub_key) public view returns (bool) {
        return users[pub_key].isRegistered;
    }

    function registerUser(bytes32 _key, string memory _role) public {
        require(!checkUser(_key), "User already registered!");

        bytes32 roleHash = keccak256(abi.encodePacked(_role));
        Role role;
        if (roleHash == keccak256(abi.encodePacked("Patient"))) {
            role = Role.Patient;
        } else if (roleHash == keccak256(abi.encodePacked("CareProvider"))) {
            role = Role.CareProvider;
        } else if (roleHash == keccak256(abi.encodePacked("Researcher"))) {
            role = Role.Researcher;
        } else if (roleHash == keccak256(abi.encodePacked("Regulator"))) {
            role = Role.Regulator;
        } else {
            revert("Invalid role!");
        }

        users[_key] = User({ role: role, isRegistered: true });
        ownerOf[_key] = msg.sender;
        emit UserRegistered(_key, msg.sender, role);
    }

    function getUserRole(bytes32 pub_key) public view returns (Role) {
        require(users[pub_key].isRegistered, "User not registered");
        return users[pub_key].role;
    }

    function getOwner(bytes32 pub_key) public view returns (address) {
        return ownerOf[pub_key];
    }
}
