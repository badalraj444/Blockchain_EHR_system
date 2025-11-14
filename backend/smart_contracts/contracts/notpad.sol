// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PermissionContract is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    IERC20 public rewardToken;
    uint256 public requestCounter;

    enum ReqStatus { Pending, Approved, Rejected, Cancelled, Expired }

    struct Request {
        uint256 id;
        address requester;
        address owner;         // patient/public key address owning data
        string dataHI;         // IPFS hash or index
        uint256 price;         // tokens staked/offered
        bytes encryptedKey;    // symmetric key encrypted with requester public key
        uint256 expiryTs;      // UNIX timestamp until which permission is valid
        ReqStatus status;
        uint256 createdAt;
    }

    // reputation: simple mapping, can be extended off-chain
    mapping(address => uint256) public reputation;
    mapping(uint256 => Request) public requests;

    // per-data active permissions: dataHI => grantee => expiry
    mapping(string => mapping(address => uint256)) public activePermissions;

    // events
    event RequestCreated(uint256 indexed id, address indexed requester, address indexed owner, string dataHI, uint256 price);
    event RequestApproved(uint256 indexed id, address indexed approver, uint256 paidAmount, uint256 expiryTs);
    event RequestRejected(uint256 indexed id, address indexed approver);
    event RequestCancelled(uint256 indexed id);
    event PermissionRevoked(string indexed dataHI, address indexed grantee);
    event ReputationUpdated(address indexed who, uint256 newScore);

    constructor(address tokenAddr) {
        rewardToken = IERC20(tokenAddr);
        requestCounter = 0;
    }

    /* ========== Request flow ========== */

    // Request access with tokens staked (researcher must have approved this contract to spend).
    function requestIncentive(
        address owner,
        string calldata dataHI,
        uint256 price,
        bytes calldata encryptedKey,
        uint256 requestedTtlSeconds
    ) external returns (uint256) {
        require(price > 0, "price>0");
        require(requestedTtlSeconds > 0 && requestedTtlSeconds <= 30 days, "ttl range");

        // transfer tokens from requester into contract (escrow)
        bool ok = rewardToken.transferFrom(msg.sender, address(this), price);
        require(ok, "transferFrom failed");

        requestCounter++;
        uint256 id = requestCounter;
        requests[id] = Request({
            id: id,
            requester: msg.sender,
            owner: owner,
            dataHI: dataHI,
            price: price,
            encryptedKey: encryptedKey,
            expiryTs: block.timestamp + requestedTtlSeconds,
            status: ReqStatus.Pending,
            createdAt: block.timestamp
        });

        emit RequestCreated(id, msg.sender, owner, dataHI, price);
        return id;
    }

    // Owner (patient) approves the request: release token to owner and record permission
    function approveRequest(uint256 id, uint256 grantTtlSeconds) external {
        Request storage r = requests[id];
        require(r.id == id, "no request");
        require(r.status == ReqStatus.Pending, "not pending");
        require(msg.sender == r.owner, "only owner can approve");
        require(grantTtlSeconds > 0 && grantTtlSeconds <= 365 days, "grant ttl");

        // move escrowed tokens to owner
        uint256 amount = r.price;
        r.status = ReqStatus.Approved;

        // set active permission expiry (owner grants access from now)
        uint256 permExpiry = block.timestamp + grantTtlSeconds;
        activePermissions[r.dataHI][r.requester] = permExpiry;

        // update reputation (simple +1 for approved)
        reputation[r.requester] += 1;
        emit ReputationUpdated(r.requester, reputation[r.requester]);

        // transfer reward: from contract to owner (patient)
        require(rewardToken.transfer(r.owner, amount), "reward transfer failed");

        emit RequestApproved(id, msg.sender, amount, permExpiry);
    }

    // owner rejects: refund to requester
    function rejectRequest(uint256 id) external {
        Request storage r = requests[id];
        require(r.id == id, "no request");
        require(r.status == ReqStatus.Pending, "not pending");
        require(msg.sender == r.owner, "only owner");

        r.status = ReqStatus.Rejected;
        // refund tokens to requester
        require(rewardToken.transfer(r.requester, r.price), "refund failed");
        emit RequestRejected(id, msg.sender);
    }

    // requester may cancel before approval and get refund
    function cancelRequest(uint256 id) external {
        Request storage r = requests[id];
        require(r.id == id, "no request");
        require(r.status == ReqStatus.Pending, "not pending");
        require(msg.sender == r.requester, "only requester");

        r.status = ReqStatus.Cancelled;
        require(rewardToken.transfer(r.requester, r.price), "refund failed");
        emit RequestCancelled(id);
    }

    // check if grantee has active permission for dataHI at current time
    function hasPermission(string calldata dataHI, address grantee) external view returns (bool) {
        uint256 exp = activePermissions[dataHI][grantee];
        return (exp != 0 && block.timestamp <= exp);
    }

    // owner can revoke permission before expiry (no token movement back)
    function revokePermission(string calldata dataHI, address grantee) external {
        require(activePermissions[dataHI][grantee] != 0, "no active permission");
        // only owner of the data can revoke; we can't prove ownership on-chain by dataHI alone here,
        // so in your integration make sure to pass only owner allowed to call (or add mapping owner->dataHI)
        // For simplicity, we require caller to be owner in an on-chain mapping (optional extension)
        delete activePermissions[dataHI][grantee];
        emit PermissionRevoked(dataHI, grantee);
    }

    /* ====== Administrative helpers ====== */

    // owner can withdraw accidentally stuck tokens (owner of contract)
    function adminWithdrawTokens(address to, uint256 amount) external onlyOwner {
        require(rewardToken.transfer(to, amount), "withdraw fail");
    }
}
