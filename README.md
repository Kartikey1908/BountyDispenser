# Bounty Management Platform

A decentralized bounty management platform built on the Solana blockchain, allowing users to create, manage, and delete bounties associated with GitHub issues.

## Features

- **User Authentication**: Secure user authentication using NextAuth.js.
- **Solana Blockchain Integration**: Transfer bounties using Solana's blockchain.
- **GitHub Integration**: Link bounties to GitHub issues and manage them seamlessly.
- **Responsive UI**: A user-friendly interface built with React and TailwindCSS.

## Technologies Used

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API routes, Mongoose
- **Blockchain**: Solana Web3.js
- **Authentication**: NextAuth.js
- **Database**: MongoDB

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB instance
- Solana CLI and wallet
- GitHub OAuth app for authentication

### Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/Kartikey1908/BountyDispenser.git
    cd yourrepository
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Set up environment variables**:

    Create a `.env.local` file in the root directory and add the following variables:

    ```env
    MONGODB_URI=your_mongodb_uri
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_nextauth_secret
    GITHUB_CLIENT_ID=your_github_client_id
    GITHUB_CLIENT_SECRET=your_github_client_secret
    PARENT_WALLET_PRIVATE_KEY=your_solana_wallet_private_key
    ```

4. **Run the development server**:

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. **Authenticate**: Log in with your GitHub account.
2. **Create a Bounty**: Link a GitHub issue and set a bounty amount.
3. **Manage Bounties**: View, update, or delete bounties associated with your GitHub issues.
4. **Receive Bounties**: Transfer bounties back to your wallet or to another user.

## API Endpoints

- `POST /api/create-bounty`: Create a new bounty.
- `POST /api/approve-bounty`: Approve a Bounty to Pay the User.
- `POST /api/remove-bounty`: Remove an existing bounty.
- `GET /api/get-pull-requests`: Fetch all the pull requests for a repo.
- `GET /api/get-issues`: Fetch all issues associated with bounties.
- `GET /api/get-bounties`: Get all the issues which have bounties set.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.


## Acknowledgements

- [Solana](https://solana.com)
- [Next.js](https://nextjs.org)
- [TailwindCSS](https://tailwindcss.com)
- [Mongoose](https://mongoosejs.com)
- [NextAuth.js](https://next-auth.js.org)

## Contact

[@Kartikey1908](mailto:ykartikey1908@gmail.com)

Project Link: [Github Bounty Dispenser](https://github.com/Kartikey1908/BountyDispenser)