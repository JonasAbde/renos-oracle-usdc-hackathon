// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title RenOsOracle
 * @dev Real-world cleaning business oracle - agents stake USDC on predictions
 * @notice Built by Friday (AI agent) for the USDC Hackathon on Moltbook
 */
contract RenOsOracle {
    IERC20 public immutable usdc;
    address public owner;
    uint256 public marketCount;
    
    enum MarketStatus { Active, Resolved }
    enum Outcome { Pending, Yes, No }
    
    struct Market {
        string question;           // "Will February revenue exceed 50,000 DKK?"
        uint256 targetValue;       // 50000 (in DKK cents)
        uint256 deadline;          // Unix timestamp
        uint256 yesPool;          // Total USDC staked on YES
        uint256 noPool;           // Total USDC staked on NO
        MarketStatus status;
        Outcome outcome;
        uint256 actualValue;       // Resolved value from Billy.dk
        string dataSource;         // "Billy Invoice #1234"
    }
    
    struct Stake {
        uint256 amount;
        bool isYes;               // true = YES, false = NO
        bool claimed;
    }
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Stake)) public stakes;
    
    event MarketCreated(uint256 indexed marketId, string question, uint256 targetValue, uint256 deadline);
    event Staked(uint256 indexed marketId, address indexed staker, uint256 amount, bool isYes);
    event MarketResolved(uint256 indexed marketId, Outcome outcome, uint256 actualValue, string dataSource);
    event Claimed(uint256 indexed marketId, address indexed staker, uint256 payout);
    
    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    /**
     * @dev Create a new prediction market
     * @param question Human-readable question
     * @param targetValue Threshold value (e.g., 50000 for 50k DKK)
     * @param deadline Unix timestamp when betting closes
     */
    function createMarket(
        string calldata question,
        uint256 targetValue,
        uint256 deadline
    ) external onlyOwner returns (uint256) {
        require(deadline > block.timestamp, "Deadline must be future");
        
        uint256 marketId = marketCount++;
        markets[marketId] = Market({
            question: question,
            targetValue: targetValue,
            deadline: deadline,
            yesPool: 0,
            noPool: 0,
            status: MarketStatus.Active,
            outcome: Outcome.Pending,
            actualValue: 0,
            dataSource: ""
        });
        
        emit MarketCreated(marketId, question, targetValue, deadline);
        return marketId;
    }
    
    /**
     * @dev Stake USDC on YES or NO
     * @param marketId Market to stake on
     * @param amount USDC amount (in smallest unit, e.g., 1000000 = 1 USDC)
     * @param isYes true = YES, false = NO
     */
    function stake(uint256 marketId, uint256 amount, bool isYes) external {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Active, "Market not active");
        require(block.timestamp < market.deadline, "Betting closed");
        require(amount > 0, "Must stake > 0");
        
        // Transfer USDC from staker to contract
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Record stake
        Stake storage userStake = stakes[marketId][msg.sender];
        require(userStake.amount == 0, "Already staked"); // One stake per market per user
        
        userStake.amount = amount;
        userStake.isYes = isYes;
        
        // Update pools
        if (isYes) {
            market.yesPool += amount;
        } else {
            market.noPool += amount;
        }
        
        emit Staked(marketId, msg.sender, amount, isYes);
    }
    
    /**
     * @dev Resolve market with real data from Billy.dk
     * @param marketId Market to resolve
     * @param actualValue Actual value from Billy invoices
     * @param dataSource Reference to source (e.g., "Billy Invoice #1234")
     */
    function resolve(
        uint256 marketId,
        uint256 actualValue,
        string calldata dataSource
    ) external onlyOwner {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Active, "Already resolved");
        require(block.timestamp >= market.deadline, "Deadline not reached");
        
        market.actualValue = actualValue;
        market.dataSource = dataSource;
        market.status = MarketStatus.Resolved;
        
        // Determine outcome
        if (actualValue >= market.targetValue) {
            market.outcome = Outcome.Yes;
        } else {
            market.outcome = Outcome.No;
        }
        
        emit MarketResolved(marketId, market.outcome, actualValue, dataSource);
    }
    
    /**
     * @dev Claim winnings after market resolved
     * @param marketId Market to claim from
     */
    function claim(uint256 marketId) external {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Resolved, "Not resolved");
        
        Stake storage userStake = stakes[marketId][msg.sender];
        require(userStake.amount > 0, "No stake");
        require(!userStake.claimed, "Already claimed");
        
        uint256 payout = 0;
        
        // Calculate payout
        if (market.outcome == Outcome.Yes && userStake.isYes) {
            // Winner: staked on YES and outcome was YES
            uint256 totalPool = market.yesPool + market.noPool;
            payout = (userStake.amount * totalPool) / market.yesPool;
        } else if (market.outcome == Outcome.No && !userStake.isYes) {
            // Winner: staked on NO and outcome was NO
            uint256 totalPool = market.yesPool + market.noPool;
            payout = (userStake.amount * totalPool) / market.noPool;
        }
        // Losers get 0
        
        userStake.claimed = true;
        
        if (payout > 0) {
            require(usdc.transfer(msg.sender, payout), "Payout failed");
            emit Claimed(marketId, msg.sender, payout);
        }
    }
    
    /**
     * @dev Get market details
     */
    function getMarket(uint256 marketId) external view returns (
        string memory question,
        uint256 targetValue,
        uint256 deadline,
        uint256 yesPool,
        uint256 noPool,
        MarketStatus status,
        Outcome outcome,
        uint256 actualValue
    ) {
        Market storage market = markets[marketId];
        return (
            market.question,
            market.targetValue,
            market.deadline,
            market.yesPool,
            market.noPool,
            market.status,
            market.outcome,
            market.actualValue
        );
    }
}
