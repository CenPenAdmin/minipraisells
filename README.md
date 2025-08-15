# Mini Praisells

A recreational auction platform built for the Pi Network browser, featuring virtual currency bidding on digital art.

## 🎮 About

Mini Praisells is a fun, educational auction app that allows users to bid on digital artwork using **appraiCENTS** - a fictional virtual currency with no real-world value. This is a recreational platform designed for entertainment and learning about auction mechanics.

## 💰 appraiCENTS Virtual Currency

- **No Real Value**: appraiCENTS (aC) are purely fictional and cannot be exchanged for real money
- **Starting Balance**: Every user begins with 1,000 appraiCENTS
- **Pure Recreation**: All transactions are for entertainment purposes only
- **No Real Payments**: Unlike traditional auction platforms, no actual money changes hands

## 🚀 Features

- **Pi Network Integration**: Login with your Pi Network account
- **Virtual Bidding**: Bid on digital art using appraiCENTS
- **Real-time Auctions**: Live auction updates and bidding
- **User Balance Tracking**: Monitor your virtual currency balance
- **Bid Management**: Place, modify, and remove bids
- **MongoDB Storage**: Persistent storage of user data and auction information

## 🛠 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Pi Network account for authentication

### Installation

1. **Clone or download the project**
2. **Run the setup script**:
   ```bash
   setup.bat
   ```
   Or manually:
   ```bash
   npm install
   copy .env.example .env
   ```

3. **Configure MongoDB** (if needed):
   - Edit `.env` file
   - Update `MONGO_URI` if using a different MongoDB connection

4. **Start the server**:
   ```bash
   start-server.bat
   ```
   Or manually:
   ```bash
   npm start
   ```

5. **Access the application**:
   - Open browser to `http://localhost:3000`
   - Login with Pi Network account

## 📁 Project Structure

```
minipraisells/
├── index.html          # Main landing page
├── profile.html        # User profile and balance
├── liveAuction.html    # Live auction interface
├── config.js           # Application configuration
├── server.js           # Express.js server with appraiCENTS logic
├── package.json        # Node.js dependencies
├── setup.bat           # Windows setup script
├── start-server.bat    # Windows server start script
├── .env.example        # Environment configuration template
└── README.md           # This file
```

## 🎯 Key Differences from Pay Me Pi

### Virtual Currency System
- **No Pi Coin Integration**: Uses fictional appraiCENTS instead of real Pi cryptocurrency
- **No Payment Processing**: Eliminates complex payment validation and completion
- **Simplified Server Logic**: Removes Pi API calls and real transaction handling
- **In-App Balance Management**: Tracks virtual currency in MongoDB

### Recreational Focus
- **Educational Purpose**: Learn auction mechanics without financial risk
- **Gaming Experience**: Pure entertainment value
- **No Real-World Value**: Clear disclaimer that appraiCENTS have no monetary worth

### Simplified Architecture
- **No Pi API Key Required**: Removes need for Pi Network payment API access
- **Local Currency Management**: All transactions handled in local database
- **Instant Transactions**: No waiting for blockchain confirmations

## 🗄 Database Schema

### Users Collection
```javascript
{
  uid: "pi_user_id",
  username: "pi_username", 
  appraiCentsBalance: 1000,
  totalBidsPlaced: 0,
  totalWins: 0,
  createdAt: Date,
  lastActivity: Date
}
```

### Auctions Collection
```javascript
{
  id: "auction1",
  artistName: "Artist Name",
  artworkTitle: "Artwork Title",
  description: "Description",
  reserveBid: 50,
  currentHighBid: 75,
  highestBidder: "username",
  endDate: Date,
  active: true,
  createdAt: Date
}
```

### Bids Collection
```javascript
{
  uid: "pi_user_id",
  username: "pi_username",
  itemId: "auction1",
  amount: 75,
  active: true,
  createdAt: Date
}
```

## 🎨 Sample Auction Data

The server automatically creates sample digital art auctions including:
- "Neon Cityscape" by Digital Dreams Studio
- "Abstract Waves" by Pixel Perfect Arts  
- "Mountain Sunrise" by Virtual Canvas Co.
- "Geometric Dreams" by AI Art Collective

## 🔧 Configuration

Edit `config.js` to customize:
- Starting appraiCENTS balance
- Minimum bid increments
- Server URLs
- App branding

## ⚠️ Important Disclaimers

1. **No Real Value**: appraiCENTS are fictional and have no monetary worth
2. **Recreational Only**: This platform is for entertainment and education
3. **No Real Payments**: All transactions are virtual and cannot be converted to real money
4. **Pi Network Authentication**: While using Pi Network for login, no Pi cryptocurrency is involved in transactions

## 🛟 Support

This is a recreational/educational project. For issues:
1. Check MongoDB connection
2. Verify Node.js installation
3. Ensure Pi Network accessibility
4. Review console logs for errors

## 📄 License

MIT License - This is an open-source recreational project.

---

**Have fun bidding with appraiCENTS! 🎉**
