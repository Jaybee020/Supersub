export const SubscriptionPluginAbi = [
  {
    inputs: [
      {
        name: '_supportedBridgingTokens',
        internalType: 'address[]',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: '_chainIds',
        type: 'uint256[]',
      },
      {
        name: '_ccipChainSelectors',
        internalType: 'uint64[]',
        type: 'uint64[]',
      },
      {
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'swapFactoryAddr',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'swapRouterAddr',
        type: 'address',
      },
      {
        internalType: 'address',
        type: 'address',
        name: '_WETH',
      },
      {
        internalType: 'address',
        name: '_tokenBridge',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_ethFeeProxy',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_erc20FeeProxy',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    name: 'AlreadyInitialized',
    type: 'error',
    inputs: [],
  },
  {
    name: 'InvalidAction',
    type: 'error',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        name: 'caller',
      },
    ],
    name: 'NotContractCaller',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'selector',
        type: 'bytes4',
      },
      {
        internalType: 'uint8',
        name: 'functionId',
        type: 'uint8',
      },
    ],
    name: 'NotImplemented',
    type: 'error',
  },
  {
    name: 'NotInitialized',
    type: 'error',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
        name: 'planId',
      },
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
        indexed: true,
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
        name: 'price',
      },
      {
        internalType: 'uint256',
        name: 'chargeInterval',
        type: 'uint256',
        indexed: false,
      },
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
        indexed: false,
      },
      {
        name: 'receivingAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'destinationChain',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PlanCreated',
    anonymous: false,
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
        indexed: true,
      },
      {
        internalType: 'address',
        name: 'beneficiary',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'address',
        name: 'subscriber',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'address',
        name: 'paymentToken',
        type: 'address',
        indexed: false,
      },
      {
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PlanSubscribed',
    anonymous: false,
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
        indexed: true,
      },
      {
        internalType: 'address',
        name: 'beneficiary',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'PlanUnsubscribed',
    anonymous: false,
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
        indexed: true,
      },
      {
        name: 'receivingAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'destinationChain',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        internalType: 'bool',
        name: 'isActive',
        indexed: false,
        type: 'bool',
      },
    ],
    name: 'PlanUpdated',
    anonymous: false,
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
        indexed: false,
      },
      {
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
        name: 'name',
      },
      {
        internalType: 'address',
        name: 'provider',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'enum ProductSubscriptionManagerPlugin.ProductType',
        name: 'productType',
        indexed: true,
        type: 'uint8',
      },
      {
        internalType: 'string',
        name: 'logoURL',
        indexed: false,
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'description',
        indexed: false,
        type: 'string',
      },
    ],
    name: 'ProductCreated',
    anonymous: false,
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
        indexed: false,
      },
      {
        internalType: 'address',
        name: 'provider',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'bool',
        name: 'isActive',
        indexed: false,
        type: 'bool',
      },
    ],
    name: 'ProductUpdated',
    anonymous: false,
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
        indexed: true,
      },
      {
        internalType: 'address',
        name: 'beneficiary',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'address',
        name: 'paymentToken',
        type: 'address',
        indexed: false,
      },
      {
        internalType: 'uint256',
        name: 'paymentAmount',
        type: 'uint256',
        indexed: false,
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'paymentReference',
        internalType: 'bytes',
        indexed: true,
        type: 'bytes',
      },
    ],
    name: 'SubscriptionCharged',
    anonymous: false,
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
        name: 'planId',
      },
      {
        internalType: 'address',
        name: 'beneficiary',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'address',
        name: 'paymentToken',
        type: 'address',
        indexed: false,
      },
      {
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'UserSubscriptionChanged',
    anonymous: false,
    type: 'event',
  },
  {
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    outputs: [
      {
        internalType: 'string',
        type: 'string',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'AUTHOR',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'string',
        type: 'string',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'NAME',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'string',
        type: 'string',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'VERSION',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'address',
        type: 'address',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'WETH',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        internalType: 'uint64',
        name: 'CCIPSelector',
        type: 'uint64',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'addCCIPchainSelector',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenAddr',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'addSupportedToken',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    outputs: [
      {
        internalType: 'uint64',
        type: 'uint64',
        name: '',
      },
    ],
    name: 'ccipChainSelectors',
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
      },
      {
        internalType: 'address',
        name: 'beneficiary',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'feeRecipient',
        type: 'address',
      },
      {
        internalType: 'uint8',
        name: 'feePercentage',
        type: 'uint8',
      },
      {
        name: '_paymentReference',
        internalType: 'bytes',
        type: 'bytes',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'charge',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        type: 'bytes32',
        name: 'name',
      },
      {
        internalType: 'string',
        name: 'description',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'logoURL',
        type: 'string',
      },
      {
        internalType: 'enum ProductSubscriptionManagerPlugin.ProductType',
        name: 'productType',
        type: 'uint8',
      },
      {
        components: [
          {
            internalType: 'uint256',
            type: 'uint256',
            name: 'price',
          },
          {
            internalType: 'uint256',
            name: 'chargeInterval',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'tokenAddress',
            type: 'address',
          },
          {
            name: 'receivingAddress',
            internalType: 'address',
            type: 'address',
          },
          {
            name: 'destinationChain',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
        internalType: 'struct ProductSubscriptionManagerPlugin.UserSubscriptionParams[]',
        name: 'initPlans',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'createProduct',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'uint256',
            type: 'uint256',
            name: 'price',
          },
          {
            internalType: 'uint256',
            name: 'chargeInterval',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'tokenAddress',
            type: 'address',
          },
          {
            name: 'receivingAddress',
            internalType: 'address',
            type: 'address',
          },
          {
            name: 'destinationChain',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
        internalType: 'struct ProductSubscriptionManagerPlugin.UserSubscriptionParams',
        name: 'initPlan',
        type: 'tuple',
      },
      {
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'paymentToken',
        type: 'address',
      },
      {
        name: 'paymentTokenSwapFee',
        internalType: 'uint24',
        type: 'uint24',
      },
      {
        internalType: 'string',
        name: 'description',
        type: 'string',
      },
    ],
    name: 'createRecurringPayment',
    stateMutability: 'nonpayable',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'price',
      },
      {
        internalType: 'uint256',
        name: 'chargeInterval',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        name: 'receivingAddress',
        internalType: 'address',
        type: 'address',
      },
      {
        name: 'destinationChain',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'createSubscriptionPlan',
    stateMutability: 'nonpayable',
    type: 'function',
    outputs: [],
  },
  {
    outputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    stateMutability: 'view',
    name: 'currentChainId',
    type: 'function',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'address',
        type: 'address',
        name: '',
      },
    ],
    stateMutability: 'view',
    name: 'erc20FeeProxy',
    type: 'function',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'address',
        type: 'address',
        name: '',
      },
    ],
    stateMutability: 'view',
    name: 'ethFeeProxy',
    type: 'function',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
      },
      {
        internalType: 'address',
        name: 'beneficiary',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'bool',
        type: 'bool',
        name: '',
      },
    ],
    name: 'hasSubscribedToPlan',
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
      },
      {
        internalType: 'address',
        name: 'beneficiary',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'gracePeriod',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        internalType: 'bool',
        type: 'bool',
        name: '',
      },
    ],
    name: 'isActivelySubscribedToPlan',
    stateMutability: 'view',
    type: 'function',
  },
  {
    outputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    stateMutability: 'view',
    name: 'numProducts',
    type: 'function',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    name: 'numSubscriptionPlans',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        type: 'bytes',
        name: '',
      },
    ],
    stateMutability: 'pure',
    name: 'onInstall',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        type: 'bytes',
        name: '',
      },
    ],
    stateMutability: 'pure',
    name: 'onUninstall',
    type: 'function',
    outputs: [],
  },
  {
    outputs: [
      {
        internalType: 'address',
        type: 'address',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'owner',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        name: 'addr',
      },
      {
        internalType: 'uint256',
        name: 'functionId',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        internalType: 'FunctionReference',
        type: 'bytes21',
        name: '',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
    name: 'pack',
  },
  {
    outputs: [
      {
        components: [
          {
            internalType: 'bytes4[]',
            name: 'interfaceIds',
            type: 'bytes4[]',
          },
          {
            name: 'dependencyInterfaceIds',
            internalType: 'bytes4[]',
            type: 'bytes4[]',
          },
          {
            name: 'executionFunctions',
            internalType: 'bytes4[]',
            type: 'bytes4[]',
          },
          {
            name: 'permittedExecutionSelectors',
            internalType: 'bytes4[]',
            type: 'bytes4[]',
          },
          {
            name: 'permitAnyExternalAddress',
            internalType: 'bool',
            type: 'bool',
          },
          {
            name: 'canSpendNativeToken',
            internalType: 'bool',
            type: 'bool',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'externalAddress',
                type: 'address',
              },
              {
                name: 'permitAnySelector',
                internalType: 'bool',
                type: 'bool',
              },
              {
                internalType: 'bytes4[]',
                name: 'selectors',
                type: 'bytes4[]',
              },
            ],
            internalType: 'struct ManifestExternalCallPermission[]',
            name: 'permittedExternalCalls',
            type: 'tuple[]',
          },
          {
            components: [
              {
                name: 'executionSelector',
                internalType: 'bytes4',
                type: 'bytes4',
              },
              {
                components: [
                  {
                    internalType: 'enum ManifestAssociatedFunctionType',
                    name: 'functionType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint8',
                    name: 'functionId',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'dependencyIndex',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct ManifestFunction',
                name: 'associatedFunction',
                type: 'tuple',
              },
            ],
            internalType: 'struct ManifestAssociatedFunction[]',
            name: 'userOpValidationFunctions',
            type: 'tuple[]',
          },
          {
            components: [
              {
                name: 'executionSelector',
                internalType: 'bytes4',
                type: 'bytes4',
              },
              {
                components: [
                  {
                    internalType: 'enum ManifestAssociatedFunctionType',
                    name: 'functionType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint8',
                    name: 'functionId',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'dependencyIndex',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct ManifestFunction',
                name: 'associatedFunction',
                type: 'tuple',
              },
            ],
            internalType: 'struct ManifestAssociatedFunction[]',
            name: 'runtimeValidationFunctions',
            type: 'tuple[]',
          },
          {
            components: [
              {
                name: 'executionSelector',
                internalType: 'bytes4',
                type: 'bytes4',
              },
              {
                components: [
                  {
                    internalType: 'enum ManifestAssociatedFunctionType',
                    name: 'functionType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint8',
                    name: 'functionId',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'dependencyIndex',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct ManifestFunction',
                name: 'associatedFunction',
                type: 'tuple',
              },
            ],
            internalType: 'struct ManifestAssociatedFunction[]',
            name: 'preUserOpValidationHooks',
            type: 'tuple[]',
          },
          {
            components: [
              {
                name: 'executionSelector',
                internalType: 'bytes4',
                type: 'bytes4',
              },
              {
                components: [
                  {
                    internalType: 'enum ManifestAssociatedFunctionType',
                    name: 'functionType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint8',
                    name: 'functionId',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'dependencyIndex',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct ManifestFunction',
                name: 'associatedFunction',
                type: 'tuple',
              },
            ],
            internalType: 'struct ManifestAssociatedFunction[]',
            name: 'preRuntimeValidationHooks',
            type: 'tuple[]',
          },
          {
            components: [
              {
                name: 'executionSelector',
                internalType: 'bytes4',
                type: 'bytes4',
              },
              {
                components: [
                  {
                    internalType: 'enum ManifestAssociatedFunctionType',
                    name: 'functionType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint8',
                    name: 'functionId',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'dependencyIndex',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct ManifestFunction',
                name: 'preExecHook',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'enum ManifestAssociatedFunctionType',
                    name: 'functionType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint8',
                    name: 'functionId',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'dependencyIndex',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct ManifestFunction',
                name: 'postExecHook',
                type: 'tuple',
              },
            ],
            internalType: 'struct ManifestExecutionHook[]',
            name: 'executionHooks',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct PluginManifest',
        type: 'tuple',
        name: '',
      },
    ],
    stateMutability: 'pure',
    name: 'pluginManifest',
    type: 'function',
    inputs: [],
  },
  {
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            type: 'string',
            name: 'name',
          },
          {
            internalType: 'string',
            name: 'version',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'author',
            type: 'string',
          },
          {
            components: [
              {
                name: 'functionSelector',
                internalType: 'bytes4',
                type: 'bytes4',
              },
              {
                name: 'permissionDescription',
                internalType: 'string',
                type: 'string',
              },
            ],
            internalType: 'struct SelectorPermission[]',
            name: 'permissionDescriptors',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct PluginMetadata',
        type: 'tuple',
        name: '',
      },
    ],
    stateMutability: 'pure',
    name: 'pluginMetadata',
    type: 'function',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'functionId',
        type: 'uint8',
      },
      {
        name: 'preExecHookData',
        internalType: 'bytes',
        type: 'bytes',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'postExecutionHook',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'functionId',
        type: 'uint8',
      },
      {
        internalType: 'address',
        type: 'address',
        name: 'sender',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'value',
      },
      {
        internalType: 'bytes',
        type: 'bytes',
        name: 'data',
      },
    ],
    outputs: [
      {
        internalType: 'bytes',
        type: 'bytes',
        name: '',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'preExecutionHook',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'functionId',
        type: 'uint8',
      },
      {
        internalType: 'address',
        type: 'address',
        name: 'sender',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'value',
      },
      {
        internalType: 'bytes',
        type: 'bytes',
        name: 'data',
      },
    ],
    name: 'preRuntimeValidationHook',
    stateMutability: 'nonpayable',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'functionId',
        type: 'uint8',
      },
      {
        components: [
          {
            internalType: 'address',
            type: 'address',
            name: 'sender',
          },
          {
            internalType: 'uint256',
            type: 'uint256',
            name: 'nonce',
          },
          {
            internalType: 'bytes',
            name: 'initCode',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'callGasLimit',
            type: 'uint256',
          },
          {
            name: 'verificationGasLimit',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'preVerificationGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxFeePerGas',
            type: 'uint256',
          },
          {
            name: 'maxPriorityFeePerGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'paymasterAndData',
            internalType: 'bytes',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
        ],
        internalType: 'struct UserOperation',
        name: 'userOp',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: 'userOpHash',
        type: 'bytes32',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    name: 'preUserOpValidationHook',
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    outputs: [
      {
        internalType: 'enum ProductSubscriptionManagerPlugin.ProductType',
        name: 'productType',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'provider',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
    ],
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    stateMutability: 'view',
    name: 'products',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'functionId',
        type: 'uint8',
      },
      {
        internalType: 'address',
        type: 'address',
        name: 'sender',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'value',
      },
      {
        internalType: 'bytes',
        type: 'bytes',
        name: 'data',
      },
    ],
    name: 'runtimeValidationFunction',
    stateMutability: 'nonpayable',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
      },
      {
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'paymentToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'beneficiary',
        type: 'address',
      },
      {
        name: 'paymentTokenSwapFee',
        internalType: 'uint24',
        type: 'uint24',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'subscribe',
    type: 'function',
    outputs: [],
  },
  {
    outputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
      },
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'price',
      },
      {
        internalType: 'uint256',
        name: 'chargeInterval',
        type: 'uint256',
      },
      {
        name: 'destinationChain',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        name: 'receivingAddress',
        internalType: 'address',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
    ],
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    name: 'subscriptionPlans',
    stateMutability: 'view',
    type: 'function',
  },
  {
    outputs: [
      {
        internalType: 'uint256',
        name: 'lastChargeDate',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'startTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'paymentToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'chargedAddress',
        type: 'address',
      },
      {
        name: 'paymentTokenSwapFee',
        internalType: 'uint24',
        type: 'uint24',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
    ],
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        name: '',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    name: 'subscriptionStatuses',
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        name: '',
      },
    ],
    outputs: [
      {
        internalType: 'bool',
        type: 'bool',
        name: '',
      },
    ],
    name: 'supportedBridgingTokens',
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    outputs: [
      {
        internalType: 'bool',
        type: 'bool',
        name: '',
      },
    ],
    name: 'supportsInterface',
    stateMutability: 'view',
    type: 'function',
  },
  {
    outputs: [
      {
        internalType: 'address',
        type: 'address',
        name: '',
      },
    ],
    stateMutability: 'view',
    name: 'swapFactory',
    type: 'function',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'address',
        type: 'address',
        name: '',
      },
    ],
    stateMutability: 'view',
    name: 'swapRouter',
    type: 'function',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'address',
        type: 'address',
        name: '',
      },
    ],
    stateMutability: 'view',
    name: 'tokenBridge',
    type: 'function',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
      },
      {
        internalType: 'address',
        name: 'beneficiary',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'unsubscribe',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'provider',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'updateProduct',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
      },
      {
        name: 'receivingAddress',
        internalType: 'address',
        type: 'address',
      },
      {
        name: 'destinationChain',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
    ],
    name: 'updateSubscriptionPlan',
    stateMutability: 'nonpayable',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
      },
      {
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'paymentToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'beneficiary',
        type: 'address',
      },
      {
        name: 'paymentTokenSwapFee',
        internalType: 'uint24',
        type: 'uint24',
      },
    ],
    name: 'updateUserSubscription',
    stateMutability: 'nonpayable',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'functionId',
        type: 'uint8',
      },
      {
        components: [
          {
            internalType: 'address',
            type: 'address',
            name: 'sender',
          },
          {
            internalType: 'uint256',
            type: 'uint256',
            name: 'nonce',
          },
          {
            internalType: 'bytes',
            name: 'initCode',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'callGasLimit',
            type: 'uint256',
          },
          {
            name: 'verificationGasLimit',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'preVerificationGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxFeePerGas',
            type: 'uint256',
          },
          {
            name: 'maxPriorityFeePerGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'paymasterAndData',
            internalType: 'bytes',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
        ],
        internalType: 'struct UserOperation',
        name: 'userOp',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: 'userOpHash',
        type: 'bytes32',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    name: 'userOpValidationFunction',
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
] as const;
