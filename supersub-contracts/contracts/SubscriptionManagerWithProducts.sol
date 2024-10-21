// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { BasePlugin } from "modular-account-libs/src/plugins/BasePlugin.sol";
import { IPluginExecutor } from "modular-account-libs/src/interfaces/IPluginExecutor.sol";
import { FunctionReference } from "modular-account-libs/src/interfaces/IPluginManager.sol";
import { ManifestFunction, ManifestAssociatedFunctionType, ManifestAssociatedFunction, PluginManifest, PluginMetadata, IPlugin } from "modular-account-libs/src/interfaces/IPlugin.sol";

import { ITokenBridge } from "./interfaces/ITokenBridge.sol";
import { IWETH } from "./interfaces/IWETH.sol";
import { IUniswapV3Factory } from "./interfaces/IUniswapV3Factory.sol";
import { ISwapRouter } from "./interfaces/IUniswapV3Router.sol";
import { ITokenBridge } from "./interfaces/ITokenBridge.sol";

/// @title Counter Plugin
/// @author Your name
/// @notice This plugin lets increment a count!
contract ProductSubscriptionManagerPlugin is BasePlugin {
    // metadata used by the pluginMetadata() method down below
    string public constant NAME = "Subscription Plugin";
    string public constant VERSION = "1.0.0";
    string public constant AUTHOR = "PY devs";

    // this is a constant used in the manifest, to reference our only dependency: the single owner plugin
    // since it is the first, and only, plugin the index 0 will reference the single owner plugin
    // we can use this to tell the modular account that we should use the single owner plugin to validate our user op
    // in other words, we'll say "make sure the person calling increment is an owner of the account using our single plugin"
    // Constants used in the manifest
    uint256 internal constant _MANIFEST_DEPENDENCY_INDEX_OWNER_RUNTIME_VALIDATION = 0;
    uint256 internal constant _MANIFEST_DEPENDENCY_INDEX_OWNER_USER_OP_VALIDATION = 1;

    /*
     * Note to Developer:
     * If you're using storage during validation, you need to use "associated storage".
     * ERC 7562 defines the associated storage rules for ERC 4337 accounts.
     * See: https://eips.ethereum.org/EIPS/eip-7562#validation-rules
     *
     * Plugins need to follow this definition for bundlers to accept user ops targeting their validation functions.
     * In this case, "count" is only used in an execution function, but nonetheless, it's worth noting
     * that a mapping from the account address is considered associated storage.
     */

    uint256 public numProducts;
    uint256 public numSubscriptionPlans;
    uint256 public currentChainId;
    address public owner;
    address public immutable WETH;
    address public immutable swapRouter;
    address public immutable swapFactory;
    address public tokenBridge;

    enum ProductType {
        RECURRING,
        SUBSCRIPTION
    }

    struct Product {
        ProductType productType;
        address provider;
        bool isActive;
        uint256 productId;
    }

    struct SubscriptionPlan {
        uint256 planId;
        uint256 productId;
        uint256 price;
        uint256 chargeInterval;
        uint256 destinationChain;
        address tokenAddress;
        address receivingAddress;
        bool isActive;
    }

    struct UserSubscription {
        uint256 lastChargeDate;
        uint256 startTime;
        uint256 endTime;
        address paymentToken;
        address chargedAddress;
        uint24 paymentTokenSwapFee;
        bool isActive;
    }

    struct UserSubscriptionParams {
        uint256 price;
        uint256 chargeInterval;
        address tokenAddress;
        address receivingAddress;
        uint256 destinationChain;
    }

    mapping(uint256 => SubscriptionPlan) public subscriptionPlans;
    mapping(uint256 => Product) public products;
    mapping(address => bool) public supportedBridgingTokens;
    mapping(address => mapping(uint256 => UserSubscription)) public subscriptionStatuses;
    mapping(uint256 => uint64) public ccipChainSelectors;

    event ProductCreated(
        uint256 productId,
        bytes32 name,
        address indexed provider,
        ProductType indexed productType,
        string logoURL,
        string description
    );
    event ProductUpdated(uint256 productId, address indexed provider, bool isActive);

    event PlanCreated(
        uint256 planId,
        uint256 indexed productId,
        uint256 price,
        uint256 chargeInterval,
        address tokenAddress,
        address receivingAddress,
        uint256 destinationChain
    );
    event PlanUpdated(uint256 indexed planId, address receivingAddress, uint256 destinationChain, bool isActive);
    event PlanSubscribed(
        uint256 indexed planId,
        address indexed beneficiary,
        address indexed subscriber,
        address paymentToken,
        uint256 endTime
    );
    event PlanUnsubscribed(uint256 indexed planId, address indexed beneficiary);
    event UserSubscriptionChanged(uint256 planId, address indexed beneficiary, address paymentToken, uint256 endTime);
    event SubscriptionCharged(
        uint256 indexed planId,
        address indexed beneficiary,
        address paymentToken,
        uint256 paymentAmount,
        uint256 timestamp
    );

    constructor(
        address[] memory _supportedBridgingTokens,
        uint256[] memory _chainIds,
        uint64[] memory _ccipChainSelectors,
        uint256 chainId,
        address swapFactoryAddr,
        address swapRouterAddr,
        address _WETH,
        address _tokenBridge
    ) {
        currentChainId = chainId;
        swapFactory = swapFactoryAddr;
        swapRouter = swapRouterAddr;
        owner = msg.sender;
        tokenBridge = _tokenBridge;
        WETH = _WETH;
        require(_chainIds.length == _ccipChainSelectors.length, "Chain selector lengths do not metch");
        for (uint i = 0; i < _supportedBridgingTokens.length; i++) {
            supportedBridgingTokens[_supportedBridgingTokens[i]] = true;
        }
        for (uint i = 0; i < _chainIds.length; i++) {
            addCCIPchainSelector(_chainIds[i], _ccipChainSelectors[i]);
        }
    }

    modifier productExists(uint256 productId) {
        require(productId < numProducts, "Product does not exist");
        _;
    }

    modifier isActiveProduct(uint256 productId) {
        Product memory product = products[productId];
        require(product.isActive, "Product not active");
        _;
    }

    modifier planExists(uint256 planId) {
        require(planId < numSubscriptionPlans, "Plan does not exist");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier isActivePlan(uint256 planId) {
        SubscriptionPlan memory plan = subscriptionPlans[planId];
        require(plan.isActive, "Subscription plan not active");
        Product memory product = products[plan.productId];
        require(product.isActive, "Product not active");
        _;
    }

    modifier isProductProviderr(uint256 productId, address caller) {
        Product memory product = products[productId];
        require(product.provider == caller, "Caller not provider");
        _;
    }

    modifier isPlanProvider(uint256 planId, address caller) {
        SubscriptionPlan memory plan = subscriptionPlans[planId];
        Product memory product = products[plan.productId];
        require(product.provider == caller, "Caller not provider");
        _;
    }

    // ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    // ┃    Execution functions    ┃
    // ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

    function addSupportedToken(address tokenAddr) public onlyOwner {
        supportedBridgingTokens[tokenAddr] = true;
    }

    function addCCIPchainSelector(uint256 chainId, uint64 CCIPSelector) public onlyOwner {
        ccipChainSelectors[chainId] = CCIPSelector;
    }

    function createProduct(
        bytes32 name,
        string memory description,
        string memory logoURL,
        ProductType productType,
        UserSubscriptionParams[] memory initPlans
    ) public {
        Product memory product = Product({
            productId: numProducts,
            provider: msg.sender,
            productType: productType,
            isActive: true
        });
        products[product.productId] = product;
        numProducts += 1;
        emit ProductCreated(product.productId, name, msg.sender, productType, logoURL, description);
        for (uint i = 0; i < initPlans.length; i++) {
            UserSubscriptionParams memory initPlan = initPlans[i];
            createSubscriptionPlan(
                product.productId,
                initPlan.price,
                initPlan.chargeInterval,
                initPlan.tokenAddress,
                initPlan.receivingAddress,
                initPlan.destinationChain
            );
        }
    }

    function updateProduct(
        uint256 productId,
        address provider,
        bool isActive
    ) public productExists(productId) isProductProviderr(productId, msg.sender) {
        Product storage product = products[productId];
        product.provider = provider;
        product.isActive = isActive;

        emit ProductUpdated(productId, provider, isActive);
    }

    function createSubscriptionPlan(
        uint256 productId,
        uint256 price,
        uint256 chargeInterval,
        address tokenAddress,
        address receivingAddress,
        uint256 destinationChain
    ) public productExists(productId) isActiveProduct(productId) isProductProviderr(productId, msg.sender) {
        require(chargeInterval <= 52 weeks && chargeInterval >= 1 days, "Invalid charge Interval ");
        if (destinationChain != currentChainId) {
            require(ccipChainSelectors[destinationChain] != 0, "destination chain not supported");
            require(supportedBridgingTokens[tokenAddress], "token specified is not supported for bridging");
        }
        SubscriptionPlan memory plan = SubscriptionPlan({
            productId: productId,
            planId: numSubscriptionPlans,
            price: price,
            chargeInterval: chargeInterval,
            tokenAddress: tokenAddress,
            receivingAddress: receivingAddress,
            isActive: true,
            destinationChain: destinationChain
        });
        subscriptionPlans[numSubscriptionPlans] = plan;
        emit PlanCreated(
            numSubscriptionPlans,
            productId,
            price,
            chargeInterval,
            tokenAddress,
            receivingAddress,
            destinationChain
        );
        numSubscriptionPlans++;
    }

    function updateSubscriptionPlan(
        uint256 planId,
        address receivingAddress,
        uint256 destinationChain,
        bool isActive
    ) public planExists(planId) isPlanProvider(planId, msg.sender) {
        SubscriptionPlan storage plan = subscriptionPlans[planId];
        plan.receivingAddress = receivingAddress;
        plan.destinationChain = destinationChain;
        plan.isActive = isActive;
        emit PlanUpdated(planId, receivingAddress, destinationChain, isActive);
    }

    //To-Do
    //Subscribe should consider if user unscubscribed previously
    function subscribe(
        uint256 planId,
        uint256 endTime,
        address paymentToken,
        address beneficiary,
        uint24 paymentTokenSwapFee
    ) public planExists(planId) isActivePlan(planId) {
        if (hasSubscribedToPlan(planId, beneficiary)) {
            revert("User already subscribed to plan");
        }
        require(beneficiary != address(0), "beneficiary can not be null address");
        require(endTime == 0 || endTime > block.timestamp, "Invalid end time provided");

        SubscriptionPlan memory plan = subscriptionPlans[planId];
        if (plan.tokenAddress != paymentToken) {
            address tokenA = plan.tokenAddress;
            address tokenB = paymentToken;
            if (plan.tokenAddress == address(0)) {
                tokenA = WETH;
            }
            if (paymentToken == address(0)) {
                tokenB = WETH;
            }
            address poolAddr = IUniswapV3Factory(swapFactory).getPool(tokenA, tokenB, paymentTokenSwapFee);
            require(poolAddr != address(0), "Pool does not exist for specified pool");
        }
        UserSubscription memory userSubscription = UserSubscription({
            startTime: block.timestamp,
            endTime: endTime,
            isActive: true,
            paymentToken: paymentToken,
            chargedAddress: msg.sender,
            paymentTokenSwapFee: paymentTokenSwapFee,
            lastChargeDate: 0
        });
        subscriptionStatuses[beneficiary][planId] = userSubscription;
        emit PlanSubscribed(planId, beneficiary, msg.sender, userSubscription.paymentToken, userSubscription.endTime);
    }

    function createRecurringPayment(
        uint256 productId,
        UserSubscriptionParams memory initPlan,
        uint256 endTime,
        address paymentToken,
        uint24 paymentTokenSwapFee,
        string memory description
    ) public {
        uint256 recurringProductId = productId;
        UserSubscriptionParams[] memory nullPlan;
        require(initPlan.receivingAddress != msg.sender, "Recurring payment to self not allowed");
        if (recurringProductId >= numProducts) {
            recurringProductId = numProducts;
            createProduct("Supersub", description, "supersub.jpg", ProductType.RECURRING, nullPlan);
        }
        Product memory recurringProduct = products[recurringProductId];
        require(recurringProduct.productType == ProductType.RECURRING, "Product is not of recurring type");
        require(recurringProduct.provider == msg.sender, "Recurring Product not belonging to user");
        createSubscriptionPlan(
            recurringProductId,
            initPlan.price,
            initPlan.chargeInterval,
            initPlan.tokenAddress,
            initPlan.receivingAddress,
            initPlan.destinationChain
        );
        //subscribe to latest plan created
        subscribe(numSubscriptionPlans - 1, endTime, paymentToken, msg.sender, paymentTokenSwapFee);
    }

    function updateUserSubscription(
        uint256 planId,
        uint256 endTime,
        address paymentToken,
        address beneficiary,
        uint24 paymentTokenSwapFee
    ) public isActivePlan(planId) {
        require(hasSubscribedToPlan(planId, beneficiary), "User not subscribed to plan");
        require(endTime > block.timestamp, "Invalid endTime Provided");
        SubscriptionPlan memory plan = subscriptionPlans[planId];
        if (plan.tokenAddress != paymentToken) {
            address tokenA = plan.tokenAddress;
            address tokenB = paymentToken;
            if (plan.tokenAddress == address(0)) {
                tokenA = WETH;
            }
            if (paymentToken == address(0)) {
                tokenB = WETH;
            }
            address poolAddr = IUniswapV3Factory(swapFactory).getPool(tokenA, tokenB, paymentTokenSwapFee);
            require(poolAddr != address(0), "Pool does not exist for specified pool");
        }
        UserSubscription storage userSubscription = subscriptionStatuses[beneficiary][planId];
        require(msg.sender == userSubscription.chargedAddress, "Not allowed to unsubscribe");
        userSubscription.paymentToken = paymentToken;
        userSubscription.endTime = endTime;
        userSubscription.paymentTokenSwapFee = paymentTokenSwapFee;
        emit UserSubscriptionChanged(planId, beneficiary, paymentToken, endTime);
    }

    function unsubscribe(uint256 planId, address beneficiary) public planExists(planId) {
        UserSubscription storage userSubscription = subscriptionStatuses[beneficiary][planId];
        require(hasSubscribedToPlan(planId, beneficiary), "User not subscribed to plan");
        require(msg.sender == userSubscription.chargedAddress, "Not allowed to unsubscribe");
        userSubscription.isActive = false;
        emit PlanUnsubscribed(planId, beneficiary);
    }

    //To-Do
    //Bridging Provider should handle swapping and bridging to destination chain
    //should also handle native ETH withdrawal on same chain. Swapping only gives WETH
    function charge(uint256 planId, address beneficiary) public isActivePlan(planId) {
        require(hasSubscribedToPlan(planId, beneficiary), "User not subscribed to plan");
        SubscriptionPlan memory plan = subscriptionPlans[planId];
        UserSubscription storage userSubscription = subscriptionStatuses[beneficiary][planId];
        require(block.timestamp - userSubscription.lastChargeDate >= plan.chargeInterval, "time Interval not met");
        require(userSubscription.startTime <= block.timestamp, "subscription is yet to start");
        require(userSubscription.endTime == 0 || userSubscription.endTime >= block.timestamp, "subscription has ended");
        userSubscription.lastChargeDate = block.timestamp;
        uint256 paymentAmount;
        if (plan.destinationChain == currentChainId) {
            if (plan.tokenAddress == userSubscription.paymentToken) {
                paymentAmount = plan.price;
                if (plan.tokenAddress == address(0)) {
                    IPluginExecutor(userSubscription.chargedAddress).executeFromPluginExternal(
                        plan.receivingAddress,
                        plan.price,
                        "0x"
                    );
                } else {
                    bytes memory callData = abi.encodeCall(IERC20.transfer, (plan.receivingAddress, plan.price));
                    IPluginExecutor(userSubscription.chargedAddress).executeFromPluginExternal(
                        plan.tokenAddress,
                        0,
                        callData
                    );
                }
            } else {
                //execute swap
                paymentAmount = executeSwap(
                    userSubscription.chargedAddress,
                    plan.receivingAddress,
                    userSubscription,
                    plan
                );
            }
        } else {
            if (plan.tokenAddress == userSubscription.paymentToken) {
                paymentAmount = plan.price;
                bytes memory approveCallData = abi.encodeCall(IERC20.approve, (tokenBridge, plan.price));
                IPluginExecutor(userSubscription.chargedAddress).executeFromPluginExternal(
                    plan.tokenAddress,
                    0,
                    approveCallData
                );
                bytes memory bridgeCallData = abi.encodeCall(
                    ITokenBridge.transferToken,
                    (ccipChainSelectors[plan.destinationChain], plan.receivingAddress, plan.tokenAddress, plan.price)
                ); //same token but on another chain
                IPluginExecutor(userSubscription.chargedAddress).executeFromPluginExternal(
                    tokenBridge,
                    0,
                    bridgeCallData
                );
            } else {
                //execute swap with contract as recipient
                paymentAmount = executeSwap(userSubscription.chargedAddress, address(this), userSubscription, plan);
                ITokenBridge(tokenBridge).transferToken(
                    ccipChainSelectors[plan.destinationChain],
                    plan.receivingAddress,
                    plan.tokenAddress,
                    plan.price
                );
            }
        }

        emit SubscriptionCharged(planId, beneficiary, userSubscription.paymentToken, paymentAmount, block.timestamp);
    }

    function hasSubscribedToPlan(uint256 planId, address beneficiary) public view returns (bool) {
        return
            (subscriptionStatuses[beneficiary][planId].endTime == 0 ||
                subscriptionStatuses[beneficiary][planId].endTime > block.timestamp) &&
            subscriptionStatuses[beneficiary][planId].isActive;
    }

    //to be used by client side to check for activeness of subscription while taking into consideration a gracePeriod
    function isActivelySubscribedToPlan(
        uint256 planId,
        address beneficiary,
        uint256 gracePeriod
    ) public view returns (bool) {
        return
            (subscriptionStatuses[beneficiary][planId].endTime == 0 ||
                subscriptionStatuses[beneficiary][planId].endTime > block.timestamp) &&
            subscriptionStatuses[beneficiary][planId].isActive &&
            (subscriptionStatuses[beneficiary][planId].lastChargeDate +
                subscriptionPlans[planId].chargeInterval +
                gracePeriod >
                block.timestamp);
    }

    function getSwapCallData(
        address _tokenIn,
        address _tokenOut,
        uint24 fee,
        address _recipient,
        uint256 amountOut,
        uint256 amountInMax
    ) internal pure returns (bytes memory callData) {
        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter.ExactOutputSingleParams({
            tokenIn: _tokenIn,
            tokenOut: _tokenOut,
            fee: fee,
            recipient: _recipient,
            amountOut: amountOut,
            amountInMaximum: amountInMax,
            sqrtPriceLimitX96: 0
        });
        return abi.encodeCall(ISwapRouter.exactOutputSingle, (params)); //try to swap with all of balance first
    }

    function executeSwap(
        address subscriber,
        address recipient,
        UserSubscription memory userSubscription,
        SubscriptionPlan memory plan
    ) private returns (uint256) {
        address tokenA = userSubscription.paymentToken;
        address tokenB = plan.tokenAddress;
        uint256 swapVal = 0;
        uint256 tokenBalance;
        if (userSubscription.paymentToken == address(0)) {
            tokenA = WETH;
            tokenBalance = address(subscriber).balance;
            swapVal = tokenBalance;
        } else {
            tokenBalance = IERC20(tokenA).balanceOf(subscriber);
        }
        if (plan.tokenAddress == address(0)) {
            tokenB = WETH;
        }
        bytes memory approveCallData = abi.encodeCall(IERC20.approve, (swapRouter, tokenBalance)); //try to swap with all of balance first
        IPluginExecutor(subscriber).executeFromPluginExternal(tokenA, 0, approveCallData);
        bytes memory callData = getSwapCallData(
            tokenA,
            tokenB,
            userSubscription.paymentTokenSwapFee,
            recipient,
            plan.price,
            ((tokenBalance * 80) / 100) //use 80% of balance as max value
        );
        bytes memory returnData = IPluginExecutor(subscriber).executeFromPluginExternal(swapRouter, swapVal, callData);
        swapVal = abi.decode(returnData, (uint256));
        approveCallData = abi.encodeCall(IERC20.approve, (swapRouter, 0)); //set approval back to 0
        IPluginExecutor(subscriber).executeFromPluginExternal(tokenA, 0, approveCallData);
        return swapVal;
    }

    //   function executeSwap(
    //     address recipient,
    //     UserSubscription memory userSubscription,
    //     SubscriptionPlan memory plan
    // ) private returns(uint256) {
    //     address tokenA = userSubscription.paymentToken;
    //     address tokenB = plan.tokenAddress;
    //     uint256 swapVal = 0;
    //     uint256 tokenBalance;
    //     if (userSubscription.paymentToken == address(0)) {
    //         tokenA = WETH;
    //         tokenBalance = address(this).balance;
    //         swapVal = tokenBalance;
    //     } else {
    //         tokenBalance = IERC20(userSubscription.paymentToken).balanceOf(address(this));
    //     }
    //     if (plan.tokenAddress == address(0)) {
    //         tokenB = WETH;
    //     }
    //     IERC20(tokenA).approve(swapRouter, tokenBalance);
    //     ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter.ExactOutputSingleParams({
    //         tokenIn: tokenA,
    //         tokenOut: tokenB,
    //         fee: userSubscription.paymentTokenSwapFee,
    //         recipient: recipient,
    //         amountInMaximum: tokenBalance,
    //         amountOut: plan.price,
    //         sqrtPriceLimitX96: 0
    //     });
    //     swapVal= ISwapRouter(swapRouter).exactOutputSingle{ value: swapVal }(params);
    //     return swapVal;
    // }

    function pack(address addr, uint256 functionId) public pure returns (FunctionReference) {
        return FunctionReference.wrap(bytes21(bytes20(addr)) | bytes21(uint168(functionId)));
    }

    // ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    // ┃    Plugin interface functions    ┃
    // ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

    /// @inheritdoc BasePlugin
    function onInstall(bytes calldata) external pure override {}

    /// @inheritdoc BasePlugin
    function onUninstall(bytes calldata) external pure override {}

    /// @inheritdoc BasePlugin
    function pluginManifest() external pure override returns (PluginManifest memory) {
        PluginManifest memory manifest;

        // since we are using the modular account, we will specify one depedency
        // which will handle the user op validation for ownership
        manifest.dependencyInterfaceIds = new bytes4[](2);
        manifest.dependencyInterfaceIds[_MANIFEST_DEPENDENCY_INDEX_OWNER_RUNTIME_VALIDATION] = type(IPlugin)
            .interfaceId;
        manifest.dependencyInterfaceIds[_MANIFEST_DEPENDENCY_INDEX_OWNER_USER_OP_VALIDATION] = type(IPlugin)
            .interfaceId;

        // we only have one execution function that can be called, which is the increment function
        // here we define that increment function on the manifest as something that can be called during execution
        manifest.executionFunctions = new bytes4[](8);
        manifest.executionFunctions[0] = this.subscribe.selector;
        manifest.executionFunctions[1] = this.unsubscribe.selector;
        manifest.executionFunctions[2] = this.updateUserSubscription.selector;
        manifest.executionFunctions[3] = this.createProduct.selector;
        manifest.executionFunctions[4] = this.createSubscriptionPlan.selector;
        manifest.executionFunctions[5] = this.updateProduct.selector;
        manifest.executionFunctions[6] = this.updateSubscriptionPlan.selector;
        manifest.executionFunctions[7] = this.createRecurringPayment.selector;

        // you can think of ManifestFunction as a reference to a function somewhere,
        // we want to say "use this function" for some purpose - in this case,
        // we'll be using the user op validation function from the single owner dependency
        // and this is specified by the depdendency index
        ManifestFunction memory ownerUserOpValidationFunction = ManifestFunction({
            functionType: ManifestAssociatedFunctionType.DEPENDENCY,
            functionId: 0, // unused since it's a dependency
            dependencyIndex: _MANIFEST_DEPENDENCY_INDEX_OWNER_USER_OP_VALIDATION
        });

        manifest.userOpValidationFunctions = new ManifestAssociatedFunction[](8);
        manifest.userOpValidationFunctions[0] = ManifestAssociatedFunction({
            executionSelector: this.subscribe.selector,
            associatedFunction: ownerUserOpValidationFunction
        });

        manifest.userOpValidationFunctions[1] = ManifestAssociatedFunction({
            executionSelector: this.unsubscribe.selector,
            associatedFunction: ownerUserOpValidationFunction
        });

        manifest.userOpValidationFunctions[2] = ManifestAssociatedFunction({
            executionSelector: this.updateUserSubscription.selector,
            associatedFunction: ownerUserOpValidationFunction
        });

        manifest.userOpValidationFunctions[3] = ManifestAssociatedFunction({
            executionSelector: this.createProduct.selector,
            associatedFunction: ownerUserOpValidationFunction
        });
        manifest.userOpValidationFunctions[4] = ManifestAssociatedFunction({
            executionSelector: this.createSubscriptionPlan.selector,
            associatedFunction: ownerUserOpValidationFunction
        });
        manifest.userOpValidationFunctions[5] = ManifestAssociatedFunction({
            executionSelector: this.updateProduct.selector,
            associatedFunction: ownerUserOpValidationFunction
        });
        manifest.userOpValidationFunctions[6] = ManifestAssociatedFunction({
            executionSelector: this.updateSubscriptionPlan.selector,
            associatedFunction: ownerUserOpValidationFunction
        });
        manifest.userOpValidationFunctions[7] = ManifestAssociatedFunction({
            executionSelector: this.createRecurringPayment.selector,
            associatedFunction: ownerUserOpValidationFunction
        });

        manifest.preRuntimeValidationHooks = new ManifestAssociatedFunction[](4);
        manifest.preRuntimeValidationHooks[0] = ManifestAssociatedFunction({
            executionSelector: this.subscribe.selector,
            associatedFunction: ManifestFunction({
                functionType: ManifestAssociatedFunctionType.PRE_HOOK_ALWAYS_DENY,
                functionId: 0,
                dependencyIndex: 0
            })
        });
        manifest.preRuntimeValidationHooks[1] = ManifestAssociatedFunction({
            executionSelector: this.unsubscribe.selector,
            associatedFunction: ManifestFunction({
                functionType: ManifestAssociatedFunctionType.PRE_HOOK_ALWAYS_DENY,
                functionId: 0,
                dependencyIndex: 0
            })
        });

        manifest.preRuntimeValidationHooks[2] = ManifestAssociatedFunction({
            executionSelector: this.updateUserSubscription.selector,
            associatedFunction: ManifestFunction({
                functionType: ManifestAssociatedFunctionType.PRE_HOOK_ALWAYS_DENY,
                functionId: 0,
                dependencyIndex: 0
            })
        });

        manifest.preRuntimeValidationHooks[3] = ManifestAssociatedFunction({
            executionSelector: this.createRecurringPayment.selector,
            associatedFunction: ManifestFunction({
                functionType: ManifestAssociatedFunctionType.PRE_HOOK_ALWAYS_DENY,
                functionId: 0,
                dependencyIndex: 0
            })
        });

        manifest.canSpendNativeToken = true;
        manifest.permitAnyExternalAddress = true;
        return manifest;
    }

    /// @inheritdoc BasePlugin
    function pluginMetadata() external pure virtual override returns (PluginMetadata memory) {
        PluginMetadata memory metadata;
        metadata.name = NAME;
        metadata.version = VERSION;
        metadata.author = AUTHOR;
        return metadata;
    }

    receive() external payable {}

    fallback() external payable {}
}
