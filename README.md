# 🎮 TREKER: Metaverse Game
*Revolutionary Unity WebGL metaverse with blockchain-powered virtual real estate*

TREKER revolutionizes virtual gaming by combining classic Monopoly mechanics with modern life simulation in a 3D metaverse where players truly own their digital assets. Built with Unity WebGL and powered by BlockDAG blockchain, players can buy, sell, and trade virtual real estate NFTs with real economic value.

**🏆 Built for BlockDAG Hackathon 2025 | Theme: On-Chain Games & Experiences**

## ✨ Key Features

### 🎯 **Metaverse Gaming**
- **Interactive 3D World** - Immersive Unity WebGL environment
- **Property Trading System** - Buy, sell, and upgrade virtual real estate
- **Life Simulation Mechanics** - Monopoly meets BitLife gameplay
- **Strategic Partnerships** - Form alliances for enhanced benefits
- **Global Leaderboards** - On-chain competition tracking

### 🏪 **NFT Marketplace**
- **Cross-Platform Trading** - Buy/sell assets outside the game
- **Portfolio Management** - Track your virtual real estate investments  
- **Real-Time Synchronization** - Assets update between game and marketplace
- **Transaction History** - Complete blockchain transaction records

### ⛓️ **Blockchain Integration**
- **True Asset Ownership** - All properties minted as NFTs
- **Smart Contract Powered** - Transparent, secure transactions
- **Multi-Token Support** - ERC20, ERC721, and ERC1155 standards
- **Passive Income** - Staking rewards and property yields

## 🏗️ Technical Architecture

### **Tech Stack**
- **Frontend Game:** Unity 2022.3+ (WebGL build)
- **Marketplace:** React 18 + TypeScript + Next.js
- **Blockchain:** BlockDAG Network (EVM-compatible)
- **Smart Contracts:** Solidity 0.8.20
- **Web3 Integration:** Thirdweb SDK
- **Development:** Forge, Foundry, ESLint
- **Storage:** IPFS for metadata
- **Styling:** Tailwind CSS

## 📋 Smart Contract Addresses

| Contract Type | Address | Purpose |
|--------------|---------|---------|
| **ERC20 Token** | `0xb4FccB2a34B1aAa59BA2d0341ea9D46E3eC5E2E5` | Game currency & rewards |
| **ERC721 NFTs** | `0x17c1f2634203A008a8299A1f34561db7c626EDd3` | Unique property assets |
| **ERC1155 Multi-tokens** | `0xEd940e654824c539e1f37923967502BAc63a1C2B` | Upgrades & bulk items |
| **Staking Contract** | `0x37b3f9A7ea77ba9d2A46a80044510d4b6B206d89` | Passive income system |
| **Profile System** | `0x75C608560384399f0c1d3C1CaCa5969b5C0bE7a5` | Player data & achievements |
| **Tip Jar** | `0x6710f4ba69dbe43b729141067fe801b7b96444c5` | Community rewards |

## 🚀 Quick Start

### **Prerequisites**
- Unity 2022.3 or later
- Node.js 18+
- npm or yarn package manager
- MetaMask or compatible wallet
- BlockDAG testnet tokens

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/Crusherbolt/Trekers-MetaVerse-Marketplace.git
cd Trekers-MetaVerse-Marketplace
```

2. **Setup Unity Game**
```bash
# Open Unity Hub
# Add project from unity-game/ folder
# Install required packages via Package Manager
```

3. **Setup Marketplace Web Application**
```bash
# Navigate to marketplace frontend
cd marketplace-frontend

# Install all dependencies
npm install

# Install React (if not already included)
npm install react react-dom

# Install Thirdweb SDK for Web3 integration
npm i thirdweb

# Install additional dependencies for React development
npm install @types/react @types/react-dom typescript

# Install Next.js framework
npm install next

# Install styling and UI dependencies
npm install tailwindcss postcss autoprefixer
npm install @headlessui/react @heroicons/react

# Start development server
npm run dev
```

4. **Alternative: One-command setup**
```bash
cd marketplace-frontend

# Install all dependencies at once
npm install && npm i thirdweb && npm install react react-dom @types/react @types/react-dom typescript next tailwindcss

# Start development server
npm run dev
```

5. **Smart Contract Development** (Optional)
```bash
cd smart-contracts
npm install
npx hardhat compile
npx hardhat test
```

### **Environment Configuration**

Create `.env.local` in marketplace-frontend/:
```env
NEXT_PUBLIC_BLOCKDAG_RPC_URL=https://rpc.blockdag.network
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x17c1f2634203A008a8299A1f34561db7c626EDd3
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

### **Development Server Commands**

```bash
# Start marketplace development server
cd marketplace-frontend
npm run dev              # Starts on http://localhost:3000

# Alternative development commands
npm run build           # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
npm run type-check     # TypeScript type checking
```

## 🎮 Gameplay Features

### **Virtual Real Estate System**
- Purchase properties with in-game currency or crypto
- Upgrade buildings to increase rental income
- Trade properties on integrated marketplace
- Form investment partnerships with other players

### **Economic Mechanics**
- **Property Income** - Earn passive rewards from owned real estate
- **Market Trading** - Speculate on property values
- **Staking Rewards** - Lock tokens for additional yields
- **Prediction Markets** - Bet on in-game events and outcomes

## 🛠️ Development

### **Project Structure**
```
├── unity-game/           # Unity WebGL metaverse game
├── marketplace-frontend/ # React/Next.js marketplace
│   ├── src/             # Source code
│   ├── pages/           # Next.js pages
│   ├── components/      # React components
│   ├── styles/          # CSS and styling
│   ├── utils/           # Utility functions
│   └── package.json     # Dependencies and scripts
├── smart-contracts/      # Solidity contracts & tests
├── docs/                # Documentation
└── deployment/          # Docker & deployment scripts
```

### **Package.json Scripts**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### **Smart Contract Development**
Built with modern Solidity patterns and tested with Foundry:

```bash
# Run tests
forge test

# Deploy contracts
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast

# Verify contracts
forge verify-contract $CONTRACT_ADDRESS src/Contract.sol:Contract --chain-id 1
```

### **Frontend Development**
React TypeScript marketplace with modern tooling:

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

## 🔧 Thirdweb Integration

### **Why Thirdweb?**
- **Simplified Web3 Integration** - Easy wallet connections and contract interactions
- **Unity SDK Support** - Seamless integration with Unity WebGL
- **Account Abstraction** - Gasless transactions and improved UX
- **Multi-platform Support** - Works across web, mobile, and Unity

### **Thirdweb Setup**
```javascript
// _app.js or _app.tsx
import { ThirdwebProvider } from "thirdweb/react";

export default function App({ Component, pageProps }) {
  return (
    
      
    
  );
}
```

## 🎯 Roadmap

### **Phase 1: Foundation** ✅
- Unity WebGL game development
- Core smart contracts deployment
- Basic marketplace functionality
- NFT minting and trading

### **Phase 2: Enhancement** 🚧
- Mobile app development
- Advanced trading features
- Social features and guilds
- Performance optimizations

### **Phase 3: Expansion** 📋
- VR/AR integration
- Real-world asset tokenization
- Multi-chain deployment
- Cross-game interoperability

### **Phase 4: Scale** 🔮
- Global tournaments
- DAO governance
- Enterprise partnerships
- Mass adoption features

## 💰 Economic Model

### **Revenue Streams**
- Marketplace transaction fees (2.5%)
- Premium game features and cosmetics
- NFT royalties on secondary sales
- Strategic partnership revenue

### **Token Economics**
- **Total Supply:** Dynamic minting based on gameplay
- **Utility:** Property purchases, upgrades, staking
- **Distribution:** Player rewards, staking yields, partnerships

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **BlockDAG Network** for providing scalable blockchain infrastructure
- **Unity Technologies** for the powerful game development platform
- **Thirdweb** for simplifying Web3 development
- **OpenZeppelin** for secure smart contract libraries
- **React & Next.js** teams for excellent frontend frameworks

## DEMO VIDEO (https://youtu.be/iQOWeNHA9OI)

## 📞 Contact & Support

- **GitHub Issues:** [Report bugs or request features](https://github.com/Crusherbolt/Trekers-MetaVerse-Marketplace/issues)
- **Documentation:** [Comprehensive guides and API docs](./docs/)
- **Community:** Join our Discord for discussions and support

**🎮 Ready to own the metaverse? Start playing TREKER today!**

*Built with ❤️ for the BlockDAG Hackathon 2025*
