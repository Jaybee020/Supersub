# Supersub Server

This is the server component of [Supersub](https://github.com/prettyirrelevant/supersub), a subscription platform powered by Alchemy's account abstraction infrastructure and Chainlink's Cross-Chain Interoperability Protocol (CCIP). The server handles various functionalities, including user authentication, subscription management, and interaction with the smart contracts.

## Features

- **User Authentication**: Securely authenticate users using Privy's authentication infrastructure.
- **Subscription Management**: Retrieve subscriptions for different products.
- **Product Management**: Manage products, plans, and associated tokens for subscription providers.
- **Transaction History**: Retrieve transaction history for deposits and withdrawals related to subscriptions and also integrate with Alchemy's webhook system to handle address activity events.
- **API Key Management**: Generate and manage API keys for secure access to the server's functionalities.
- **API Documentation**: Detailed documentation for the server's API endpoints is available [here](https://supersubv1.apidocumentation.com/reference).

## Technologies Used

- **Node.js**: Server-side JavaScript runtime environment.
- **Express.js**: Web application framework for Node.js.
- **Prisma**: Object-Relational Mapping (ORM) library for interacting with the database.
- **Viem**: Ethereum JavaScript library for interacting with Ethereum-based blockchains.
- **Alchemy Web3**: Alchemy's Web3 API for interacting with the account abstraction infrastructure.

## Getting Started

1. Clone the repository:
```
git clone https://github.com/prettyirrelevant/supersub-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file and provide the necessary environment variables from the `.env.example` file

4. Setup database and apply migrations:
```bash
# Generate Prisma Client
npm run db:generate

# Apply migrations
npm run db:migrate
```

5. Start the server
```bash
npm run dev
```

