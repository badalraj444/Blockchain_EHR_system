// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC20.sol";
import "./ERC20.sol";


contract Custodian {
    IERC20 public token;
    address public permissionContract; // permission contract allowed to call credit/refund flows
    address public admin; // multisig/admin (optional use)

    uint256 public nextRequestId;

    enum ReqStatus { Pending, Approved, Cancelled, Refunded, Frozen }

    struct Request {
        uint256 id;
        address requester;   // wallet that deposited tokens
        bytes32 requesterKey; // optional public-key identifier (app-level)
        bytes32 ownerKey;    // owner public-key (app-level)
        string dataHI;       // IPFS hash or identifier
        uint256 price;       // tokens escrowed
        uint256 expiryTs;    // TTL for approval (if expired, requester can refund)
        ReqStatus status;
        uint256 createdAt;
    }

    // request storage
    mapping(uint256 => Request) public requests;

    // owner claimable balances (credited after approval)
    mapping(address => uint256) public balances;

    // requestId => escrowed amount (duplicate of request.price but handy)
    mapping(uint256 => uint256) public escrow;

    // events for UI/watcher
    event Deposit(uint256 indexed requestId, address indexed requester, bytes32 indexed ownerKey, string dataHI, uint256 price, uint256 expiryTs);
    event Credit(uint256 indexed requestId, address indexed ownerAddress, uint256 amount);
    event Claim(address indexed ownerAddress, uint256 amount);
    event Cancelled(uint256 indexed requestId);
    event Refunded(uint256 indexed requestId, address indexed requester, uint256 amount);
    event Frozen(uint256 indexed requestId);
    event Unfrozen(uint256 indexed requestId);

    modifier onlyPermissionContract() {
        require(msg.sender == permissionContract, "only permission contract");
        _;
    }

    constructor(address tokenAddr, address _permissionContract) {
        require(tokenAddr != address(0), "token zero");
        token = IERC20(tokenAddr);
        permissionContract = _permissionContract;
        admin = msg.sender;
        nextRequestId = 1;
    }

    // Admin can change permission contract if needed
    function setPermissionContract(address _perm) external {
        require(msg.sender == admin, "only admin");
        permissionContract = _perm;
    }

    // Researcher deposits tokens and creates a request.
    // researcher's wallet must approve this contract to spend `price` tokens beforehand.
    // ownerKey is the patient/public-key identifier used by the app (bytes32).
    function depositRequest(
        bytes32 ownerKey,
        bytes32 requesterKey,
        string calldata dataHI,
        uint256 price,
        uint256 ttlSeconds
    ) external returns (uint256) {
        require(price > 0, "price>0");
        require(ttlSeconds > 0, "ttl>0");

        // Pull tokens into escrow
        bool ok = token.transferFrom(msg.sender, address(this), price);
        require(ok, "transferFrom failed");

        uint256 id = nextRequestId++;
        uint256 expiry = block.timestamp + ttlSeconds;

        requests[id] = Request({
            id: id,
            requester: msg.sender,
            requesterKey: requesterKey,
            ownerKey: ownerKey,
            dataHI: dataHI,
            price: price,
            expiryTs: expiry,
            status: ReqStatus.Pending,
            createdAt: block.timestamp
        });

        escrow[id] = price;

        emit Deposit(id, msg.sender, ownerKey, dataHI, price, expiry);
        return id;
    }

    // Called by Permission contract (or owner via permission contract) to credit the owner's claimable balance.
    // Permission contract enforces that the caller is the owner/has the right to approve.
    function credit(uint256 requestId, address ownerAddress) external onlyPermissionContract {
        Request storage r = requests[requestId];
        require(r.id == requestId, "invalid request");
        require(r.status == ReqStatus.Pending, "not pending");
        require(escrow[requestId] > 0, "no escrow");

        // mark approved
        r.status = ReqStatus.Approved;

        uint256 amount = escrow[requestId];
        escrow[requestId] = 0;

        // credit the owner (claimable)
        balances[ownerAddress] += amount;

        emit Credit(requestId, ownerAddress, amount);
    }

    // Owner (patient) or any address with claimable balance calls to withdraw tokens to their wallet.
    function claim() external {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "no balance");

        balances[msg.sender] = 0;
        bool ok = token.transfer(msg.sender, bal);
        require(ok, "transfer failed");

        emit Claim(msg.sender, bal);
    }

    // Requester cancels a pending request (before approval) and gets refund.
    function cancelRequest(uint256 requestId) external {
        Request storage r = requests[requestId];
        require(r.id == requestId, "invalid request");
        require(r.status == ReqStatus.Pending, "not pending");
        require(msg.sender == r.requester, "only requester");

        uint256 amount = escrow[requestId];
        escrow[requestId] = 0;
        r.status = ReqStatus.Cancelled;

        bool ok = token.transfer(r.requester, amount);
        require(ok, "refund failed");

        emit Cancelled(requestId);
        emit Refunded(requestId, r.requester, amount);
    }

    // Refund after TTL expired (if owner never approved): anyone can trigger refund to requester after expiry
    function refundAfterExpiry(uint256 requestId) external {
        Request storage r = requests[requestId];
        require(r.id == requestId, "invalid request");
        require(r.status == ReqStatus.Pending, "not pending");
        require(block.timestamp > r.expiryTs, "not expired");

        uint256 amount = escrow[requestId];
        escrow[requestId] = 0;
        r.status = ReqStatus.Refunded;

        bool ok = token.transfer(r.requester, amount);
        require(ok, "refund failed");

        emit Refunded(requestId, r.requester, amount);
    }

    // Admin or multisig can freeze a request (investigation)
    function freezeRequest(uint256 requestId) external {
        require(msg.sender == admin, "only admin");
        Request storage r = requests[requestId];
        require(r.id == requestId, "invalid request");
        r.status = ReqStatus.Frozen;
        emit Frozen(requestId);
    }

    function unfreezeRequest(uint256 requestId) external {
        require(msg.sender == admin, "only admin");
        Request storage r = requests[requestId];
        require(r.id == requestId, "invalid request");
        // revert back to pending if it was frozen
        if (r.status == ReqStatus.Frozen) {
            r.status = ReqStatus.Pending;
        }
        emit Unfrozen(requestId);
    }

    // Basic getters for UI (some are already public)
    function getRequest(uint256 requestId) external view returns (
        uint256 id,
        address requester,
        bytes32 requesterKey,
        bytes32 ownerKey,
        string memory dataHI,
        uint256 price,
        uint256 expiryTs,
        ReqStatus status,
        uint256 createdAt
    ) {
        Request storage r = requests[requestId];
        return (r.id, r.requester, r.requesterKey, r.ownerKey, r.dataHI, r.price, r.expiryTs, r.status, r.createdAt);
    }
}
