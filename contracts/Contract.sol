// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
contract BountyHub is ReentrancyGuard {
    IERC20 public cUSD;
    address public owner;
    uint256 public platformFee = 700; // 7% in basis points (700/10000 = 7%)
    address public platformWallet;
    
    struct Task {
        string title;
        string description;
        uint256 reward;
        address creator;
        address worker;
        string proof;
        bool completed;
        bool paid;
        uint256 createdAt;
        uint256 completedAt;
    }

    Task[] public tasks;
    
    // Events
    event TaskCreated(uint256 indexed id, string title, uint256 reward, address creator);
    event TaskAccepted(uint256 indexed id, address worker);
    event ProofSubmitted(uint256 indexed id, string proof);
    event RewardPaid(uint256 indexed id, address worker, uint256 amount, uint256 fee);
    event TaskCancelled(uint256 indexed id, address creator);
    event PlatformFeeUpdated(uint256 newFee);
    event PlatformWalletUpdated(address newWallet);

    constructor(address _cUSD, address _platformWallet) {
        cUSD = IERC20(_cUSD);
        owner = msg.sender;
        platformWallet = _platformWallet;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function createTask(
        string memory _title, 
        string memory _desc, 
        uint256 _reward
    ) external {
        require(_reward > 0, "Reward must be positive");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        require(
            cUSD.transferFrom(msg.sender, address(this), _reward), 
            "Transfer failed"
        );
        
        tasks.push(Task({
            title: _title,
            description: _desc,
            reward: _reward,
            creator: msg.sender,
            worker: address(0),
            proof: "",
            completed: false,
            paid: false,
            createdAt: block.timestamp,
            completedAt: 0
        }));
        
        emit TaskCreated(tasks.length - 1, _title, _reward, msg.sender);
    }

    function acceptTask(uint256 _id) external {
        require(_id < tasks.length, "Task does not exist");
        Task storage task = tasks[_id];
        require(task.worker == address(0), "Task already taken");
        require(msg.sender != task.creator, "Creator cannot accept own task");
        
        task.worker = msg.sender;
        emit TaskAccepted(_id, msg.sender);
    }

    function submitProof(uint256 _id, string memory _proof) external {
        require(_id < tasks.length, "Task does not exist");
        Task storage task = tasks[_id];
        require(task.worker == msg.sender, "Not worker");
        require(!task.completed, "Proof already submitted");
        require(bytes(_proof).length > 0, "Proof cannot be empty");
        
        task.proof = _proof;
        task.completed = true;
        task.completedAt = block.timestamp;
        
        emit ProofSubmitted(_id, _proof);
    }

    function releasePayment(uint256 _id) external nonReentrant {
        require(_id < tasks.length, "Task does not exist");
        Task storage task = tasks[_id];
        require(task.creator == msg.sender, "Not creator");
        require(task.completed, "Task not completed");
        require(!task.paid, "Already paid");
        require(task.worker != address(0), "No worker assigned");
        
        task.paid = true;
        
        // Calculate platform fee (7%) and worker amount (93%)
        uint256 feeAmount = (task.reward * platformFee) / 10000;
        uint256 workerAmount = task.reward - feeAmount;
        
        // Transfer fee to platform wallet
        if (feeAmount > 0) {
            require(
                cUSD.transfer(platformWallet, feeAmount),
                "Fee transfer failed"
            );
        }
        
        // Transfer remaining to worker
        require(
            cUSD.transfer(task.worker, workerAmount),
            "Worker transfer failed"
        );
        
        emit RewardPaid(_id, task.worker, workerAmount, feeAmount);
    }

    function cancelTask(uint256 _id) external nonReentrant {
        require(_id < tasks.length, "Task does not exist");
        Task storage task = tasks[_id];
        require(task.creator == msg.sender, "Not creator");
        require(task.worker == address(0), "Task already accepted");
        require(!task.paid, "Already paid");
        
        task.completed = true;
        task.paid = true;
        
        require(
            cUSD.transfer(task.creator, task.reward),
            "Refund transfer failed"
        );
        
        emit TaskCancelled(_id, msg.sender);
    }

    // Admin functions
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = _newFee;
        emit PlatformFeeUpdated(_newFee);
    }

    function setPlatformWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid address");
        platformWallet = _newWallet;
        emit PlatformWalletUpdated(_newWallet);
    }

    function withdrawStuckTokens(address _token) external onlyOwner {
        IERC20 token = IERC20(_token);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens");
        require(token.transfer(owner, balance), "Transfer failed");
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }

    // View functions
    function getTasks() external view returns (Task[] memory) {
        return tasks;
    }
    
    function getTaskCount() external view returns (uint256) {
        return tasks.length;
    }
    
    function getTask(uint256 _id) external view returns (Task memory) {
        require(_id < tasks.length, "Task does not exist");
        return tasks[_id];
    }
    
    function getContractBalance() external view returns (uint256) {
        return cUSD.balanceOf(address(this));
    }

    function calculateFee(uint256 _amount) external view returns (uint256 fee, uint256 netAmount) {
        fee = (_amount * platformFee) / 10000;
        netAmount = _amount - fee;
    }

    function getPlatformInfo() external view returns (address, uint256, address) {
        return (platformWallet, platformFee, owner);
    }
}
