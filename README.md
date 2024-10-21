<h1 align="center">
    <br>
    <a href="https://supersub.vercel.app">
        <img src="./.github/supersub.png" alt="Supersub logo" />
    </a>
    <br>
</h1>

<h3 align="center">Experience hassle-free token movement across EVM compatible chains</h3>

<p align="center">
     <img src="https://img.shields.io/badge/Solidity-0.8.17-1f425f.svg?style=for-the-badge&logo=solidity" alt="Solidity version">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="Typescript version">
    <img src="https://img.shields.io/badge/built%20with-OpenZeppelin-3677FF?style=for-the-badge" alt="Built with Openzepellin">
    <img src="https://img.shields.io/github/contributors/prettyirrelevant/bridgebloc?style=for-the-badge" alt="contributors">
</p>

<p align="center">
    <a href="#-Introduction">Introduction</a> •
    <a href="#-demo">Demo</a> •
    <a href="#-features">Features</a> •
    <a href="#-folder-structure">Folder Structure</a> •
    <a href="#-api-documentation">API Documentation</a> •
    <a href="#-contributing">Contributing</a> •
    <a href="#-team">Team</a>
</p>

## 🎯 Introduction

Supersub is an innovative, decentralized platform that facilitates seamless periodic(recurring) payments on-chain. Our protocol eliminates the need for trust and centralized control, ensuring that all subscriptions are secure, permanent and borderless.

At Supersub, we automatically process recurring payments for a fee, ensuring a smooth user experience while generating revenue for our platform. We also allow public participation in payment processing, enabling individuals and external providers to process payments and earn rewards for their contributions. Enjoy the freedom and efficiency of managing your subscription payments on the blockchain with Superb.

## 🎥 Demo

[//]: # "[![Watch the video](https://img.youtube.com/vi/zV8lfBa39q8/maxresdefault.jpg)](https://youtu.be/zV8lfBa39q8)"

## 🎯 Features

<sup>[(Back to top)](#------------------------)</sup>

### Problems with TradFi

Traditional payment processors are centralized systems that charge fees for managing recurring payments. This model mandates that both the sender and recipient be authorized users, able to revoke permissions at any time and for any reason. Additionally, this model can limit access, particularly in regions where local providers do not support specific subscription services. It also introduces the risk of payment processing failures, as it relies on central servers for transaction management.

For example, I have experienced firsthand the challenges and frustrations arising from traditional subscription services. For instance, while trying to subscribe to Twitter Blue in Nigeria, I encountered numerous obstacles, as local providers often do not support the necessary payment methods. This centralization and localization limit access to services based on geographic location, leaving many potential users without options. By building Superb, I aim to break down these barriers and create a truly global and accessible subscription service

### Why Supersub?

Recognizing the limitations of traditional subscription payment models, I am building Supersub to offer a more inclusive and decentralized alternative. By leveraging blockchain technology, Supersub transforms the way subscription payments are created and managed.

Instead of relying on a central payment processor, Supersub allows anyone to participate in payment processing through a community-powered system. This unique approach not only empowers individuals to handle subscription dues and earn rewards from fees that would typically go to centralized processors, but it also fosters a decentralized network that enhances security and reliability.

Key features of Supersub include:

- **Decentralized and Secure**: Built on a permissionless and trustless protocol, Supersub guarantees that all subscription transactions are immutable and secure, eliminating the risk of centralized control. This opens up a truly global and borderless subscription service.
- **EVM Asset Compatibility**: Users can easily manage subscriptions with ERC-20 tokens and native ETH, providing flexibility for businesses and customers.
- **Multi Chain Compatibility**: Users can easily send and receive one-time and recurring payments across multiple EVM-compatible blockchains, including Ethereum, Arbitrum, and Optimism. This ensures seamless transactions across different networks, providing a smooth and efficient payment experience.
- **Continuous Automation of Payments**: Our model ensures that payments are processed automatically, reducing the need for manual intervention and enhancing user experience. It also allows for token swaps and conversions, making it a versatile platform for a wide range of subscription services.
- **Transparency and Control**: With every transaction recorded on the blockchain, subscribers and service providers gain unprecedented transparency and control over their subscription agreements.
- **Cost-Effective**: By removing intermediaries and using Base's blockchain technology, Supersub offers a cost-effective solution for managing subscription payments.

In this way, Supersub not only addresses the issues of centralization and censorship but also empowers businesses with seamless subscription management while offering subscribers more control and flexibility over their payments. Join us in shaping the future of digital subscriptions.

### Here's how we make it happen:

#### 1. Account Abstraction

Supersub leverages smart contract wallets designed according to the ERC-6900 standard. This standard offers a secure and reliable framework for the easy onboarding and management of user accounts.
A standout feature of our implementation is the abstraction of gas payments, which means users are not required to hold native tokens to cover gas fees. By utilizing paymaster functionality, we significantly simplify the user experience, allowing users to engage with our platform without the complexities of managing gas fees.

#### 2. Subscription Plugin

Our platform is powered by a specialized subscription plugin that empowers these smart contract wallets to automate recurring payments. This functionality ensures that transactions are executed reliably and securely without manual intervention.

#### 3. Token Bridge

Supersub implements a token bridge that enables seamless transfers of supported tokens across various EVM-compatible chains. This bridge ensures that users can effortlessly move their tokens between different networks, enhancing the overall user experience.

#### 4. Affordable Transaction Fees

Due to Base's low gast cost, we are able to come up with a reasonable fee structure by capping the maximum percenatage used as the fee to a value of 7.5%. Lower values would be used as long as the fee percentage covers the gas cost of the charge transaction.

### Upcoming Enhancements

We're committed to continuous improvement. Here's what's in the pipeline:

- **Supersub SDK:** We're working on a Supersub SDK to simplify the integration process and enhance the developer experience.

- **Fiat On & Off-Ramp:** We plan to introduce a feature that will allow you to easily convert between digital assets and fiat currency.

Stay tuned for these exciting enhancements!

### Important Information

Just there

## 🔄 Token Transfer Routes

<sup>[(Back to top)](#------------------------)</sup>

Our project provides convenient routes for transferring tokens across various EVM-compatible chains.
These routes specify the paths for moving tokens between source and destination chains:

## 🌵 Folder Structure

<sup>[(Back to top)](#------------------------)</sup>

```sh
.
├── backend   (node.js Application)
├── contracts (Smart contracts)
└── frontend  (React SPA)
```

## 📜 API Documentation

<sup>[(Back to top)](#------------------------)</sup>

For in-depth API documentation, please refer to the following link:

- [Swagger Doc](https://bridgebloc-api-eb9bd3c3ed18.herokuapp.com/api/docs)

## 👍 Contributing

<sup>[(Back to top)](#------------------------)</sup>

We believe in the power of collaboration and welcome contributions from all members of the community irrespective of your domain knowledge and level of expertise,
your input is valuable.
Here are a few ways you can get involved:

- **Spread the Word**: Help us reach more enthusiasts by sharing the project with your network. The more creators and collectors we bring together, the stronger our community becomes.
- **Feature Requests**: If you have ideas for new features or improvements, share them with us! We're excited to hear how we can enhance the marketplace to better serve the community.
- **Code Contributions**: Developers can contribute by submitting pull requests. Whether it's fixing bugs, optimizing code, or adding new functionalities, your code contributions are invaluable.
- **Bug Reports and Feedback**: If you encounter any issues or have suggestions for improvement, please open an issue on GitHub.

## 👥 Team

<sup>[(Back to top)](#------------------------)</sup>

Meet the creative minds who brought this project to life:

| **Name**        | **Role**                                 | **GitHub**                             |
| --------------- | ---------------------------------------- | -------------------------------------- |
| Olayinka Ganiyu | Smart Contract & Backend Engineer (LxLy) | [GitHub](https://github.com/Jaybee020) |
| Kester Atakere  | Designer & Frontend Engineer             | [GitHub](https://github.com/codergon)  |
