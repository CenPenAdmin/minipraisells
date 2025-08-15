// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const CONFIG = require('./config.js');

// MongoDB configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = 'minipraisells';
let db;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://CenPenAdmin.github.io',
            'https://f2c07e99fbd6.ngrok-free.app'
        ];
        
        const allowedPatterns = [
            /^https:\/\/.*\.ngrok\.io$/,
            /^https:\/\/.*\.ngrok-free\.app$/,
            /^https:\/\/.*\.github\.io$/,
            /^http:\/\/localhost:\d+$/,
            /^http:\/\/127\.0\.0\.1:\d+$/
        ];
        
        // Check exact matches
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Check pattern matches
        if (allowedPatterns.some(pattern => pattern.test(origin))) {
            return callback(null, true);
        }
        
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'ngrok-skip-browser-warning'],
    exposedHeaders: ['*'],
    maxAge: 86400
}));

// Handle preflight requests for all routes
app.options('*', cors());

app.use(bodyParser.json());

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Origin:', req.get('origin'));
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    console.log('---');
    next();
});
app.use(express.static('.')); // Serve static files from current directory

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(DATABASE_NAME);
        console.log('✅ Connected to MongoDB at', MONGO_URI);
        console.log('📊 Database:', DATABASE_NAME);
        
        // Initialize collections
        await initializeCollections();
        
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

// Initialize database collections
async function initializeCollections() {
    try {
        // Create collections if they don't exist
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        if (!collectionNames.includes('users')) {
            await db.createCollection('users');
            console.log('📝 Created users collection');
        }
        
        if (!collectionNames.includes('auctions')) {
            await db.createCollection('auctions');
            console.log('📝 Created auctions collection');
            
            // Add sample auction data
            await addSampleAuctions();
        }
        
        if (!collectionNames.includes('bids')) {
            await db.createCollection('bids');
            console.log('📝 Created bids collection');
        }
        
    } catch (error) {
        console.error('❌ Error initializing collections:', error);
    }
}

// Add sample auction data
async function addSampleAuctions() {
    const sampleAuctions = [
        {
            id: 'auction1',
            artistName: 'Digital Dreams Studio',
            artworkTitle: 'Neon Cityscape',
            description: 'A vibrant digital painting of a futuristic city at night',
            reserveBid: 50,
            currentHighBid: 0,
            highestBidder: null,
            imageUrl: null,
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            active: true,
            createdAt: new Date()
        },
        {
            id: 'auction2',
            artistName: 'Pixel Perfect Arts',
            artworkTitle: 'Abstract Waves',
            description: 'Beautiful flowing abstract waves in digital medium',
            reserveBid: 75,
            currentHighBid: 0,
            highestBidder: null,
            imageUrl: null,
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            active: true,
            createdAt: new Date()
        },
        {
            id: 'auction3',
            artistName: 'Virtual Canvas Co.',
            artworkTitle: 'Mountain Sunrise',
            description: 'Serene digital landscape of mountains at sunrise',
            reserveBid: 30,
            currentHighBid: 0,
            highestBidder: null,
            imageUrl: null,
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            active: true,
            createdAt: new Date()
        },
        {
            id: 'auction4',
            artistName: 'AI Art Collective',
            artworkTitle: 'Geometric Dreams',
            description: 'Intricate geometric patterns created with AI assistance',
            reserveBid: 100,
            currentHighBid: 0,
            highestBidder: null,
            imageUrl: null,
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            active: true,
            createdAt: new Date()
        }
    ];
    
    await db.collection('auctions').insertMany(sampleAuctions);
    console.log('🎨 Added sample auction data');
}

// Initialize or get user with starting appraiCENTS
async function initializeUser(uid, username) {
    try {
        let user = await db.collection('users').findOne({ uid: uid });
        
        if (!user) {
            // Create new user with starting balance
            user = {
                uid: uid,
                username: username,
                appraiCentsBalance: CONFIG.STARTING_APPRAICENTS,
                totalBidsPlaced: 0,
                totalWins: 0,
                createdAt: new Date(),
                lastActivity: new Date()
            };
            
            await db.collection('users').insertOne(user);
            console.log(`👤 New user created: ${username} with ${CONFIG.STARTING_APPRAICENTS} appraiCENTS`);
        } else {
            // Update last activity
            await db.collection('users').updateOne(
                { uid: uid },
                { $set: { lastActivity: new Date() } }
            );
        }
        
        return user;
    } catch (error) {
        console.error('Error initializing user:', error);
        throw error;
    }
}

// API Routes

// Get user balance
app.post('/api/user/balance', async (req, res) => {
    try {
        const { uid, username } = req.body;
        
        if (!uid || !username) {
            return res.json({ success: false, message: 'UID and username required' });
        }
        
        const user = await initializeUser(uid, username);
        
        res.json({
            success: true,
            balance: user.appraiCentsBalance,
            user: {
                username: user.username,
                totalBids: user.totalBidsPlaced,
                totalWins: user.totalWins
            }
        });
        
    } catch (error) {
        console.error('Error getting user balance:', error);
        res.json({ success: false, message: 'Error retrieving balance' });
    }
});

// Get active auctions
app.get('/api/auctions', async (req, res) => {
    try {
        const auctions = await db.collection('auctions').find({ active: true }).toArray();
        
        res.json({
            success: true,
            auctions: auctions
        });
        
    } catch (error) {
        console.error('Error getting auctions:', error);
        res.json({ success: false, message: 'Error retrieving auctions' });
    }
});

// Get user's current bids
app.post('/api/user/bids', async (req, res) => {
    try {
        const { uid } = req.body;
        
        if (!uid) {
            return res.json({ success: false, message: 'UID required' });
        }
        
        const bids = await db.collection('bids').find({ uid: uid, active: true }).toArray();
        
        res.json({
            success: true,
            bids: bids
        });
        
    } catch (error) {
        console.error('Error getting user bids:', error);
        res.json({ success: false, message: 'Error retrieving bids' });
    }
});

// Place a bid
app.post('/api/bid', async (req, res) => {
    try {
        const { uid, username, auctionId, bidAmount } = req.body;
        
        if (!uid || !username || !auctionId || !bidAmount) {
            return res.json({ success: false, message: 'All fields required' });
        }
        
        // Get user
        const user = await db.collection('users').findOne({ uid: uid });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        // Check if user has sufficient balance
        if (user.appraiCentsBalance < bidAmount) {
            return res.json({ success: false, message: 'Insufficient appraiCENTS balance' });
        }
        
        // Get auction
        const auction = await db.collection('auctions').findOne({ id: auctionId, active: true });
        if (!auction) {
            return res.json({ success: false, message: 'Auction not found or inactive' });
        }
        
        // Check if bid is high enough
        const minimumBid = (auction.currentHighBid || auction.reserveBid) + CONFIG.MIN_BID_INCREMENT;
        if (bidAmount < minimumBid) {
            return res.json({ success: false, message: `Bid must be at least ${minimumBid} aC` });
        }
        
        // Check for existing bid from this user
        const existingBid = await db.collection('bids').findOne({ 
            uid: uid, 
            itemId: auctionId, 
            active: true 
        });
        
        if (existingBid) {
            // Refund previous bid amount
            await db.collection('users').updateOne(
                { uid: uid },
                { $inc: { appraiCentsBalance: existingBid.amount } }
            );
            
            // Deactivate old bid
            await db.collection('bids').updateOne(
                { _id: existingBid._id },
                { $set: { active: false, replacedAt: new Date() } }
            );
        }
        
        // If this bid is higher than current high, refund the previous highest bidder
        if (auction.currentHighBid > 0 && auction.highestBidder && auction.highestBidder !== username) {
            const previousHighBid = await db.collection('bids').findOne({
                itemId: auctionId,
                username: auction.highestBidder,
                active: true
            });
            
            if (previousHighBid) {
                await db.collection('users').updateOne(
                    { uid: previousHighBid.uid },
                    { $inc: { appraiCentsBalance: previousHighBid.amount } }
                );
                
                await db.collection('bids').updateOne(
                    { _id: previousHighBid._id },
                    { $set: { active: false, outbidAt: new Date() } }
                );
            }
        }
        
        // Deduct bid amount from user's balance
        await db.collection('users').updateOne(
            { uid: uid },
            { 
                $inc: { 
                    appraiCentsBalance: -bidAmount,
                    totalBidsPlaced: 1
                } 
            }
        );
        
        // Create new bid
        const newBid = {
            uid: uid,
            username: username,
            itemId: auctionId,
            amount: bidAmount,
            active: true,
            createdAt: new Date()
        };
        
        await db.collection('bids').insertOne(newBid);
        
        // Update auction with new high bid
        await db.collection('auctions').updateOne(
            { id: auctionId },
            { 
                $set: { 
                    currentHighBid: bidAmount,
                    highestBidder: username,
                    lastBidAt: new Date()
                } 
            }
        );
        
        console.log(`💰 Bid placed: ${username} bid ${bidAmount} aC on ${auctionId}`);
        
        res.json({
            success: true,
            message: 'Bid placed successfully',
            newBalance: user.appraiCentsBalance - bidAmount + (existingBid ? existingBid.amount : 0)
        });
        
    } catch (error) {
        console.error('Error placing bid:', error);
        res.json({ success: false, message: 'Error placing bid' });
    }
});

// Remove a bid
app.post('/api/bid/remove', async (req, res) => {
    try {
        const { uid, auctionId } = req.body;
        
        if (!uid || !auctionId) {
            return res.json({ success: false, message: 'UID and auction ID required' });
        }
        
        // Find the user's active bid
        const bid = await db.collection('bids').findOne({ 
            uid: uid, 
            itemId: auctionId, 
            active: true 
        });
        
        if (!bid) {
            return res.json({ success: false, message: 'No active bid found' });
        }
        
        // Refund the bid amount
        await db.collection('users').updateOne(
            { uid: uid },
            { $inc: { appraiCentsBalance: bid.amount } }
        );
        
        // Deactivate the bid
        await db.collection('bids').updateOne(
            { _id: bid._id },
            { $set: { active: false, removedAt: new Date() } }
        );
        
        // Update auction - need to find new highest bidder
        const remainingBids = await db.collection('bids')
            .find({ itemId: auctionId, active: true })
            .sort({ amount: -1 })
            .toArray();
        
        let newHighBid = 0;
        let newHighBidder = null;
        
        if (remainingBids.length > 0) {
            newHighBid = remainingBids[0].amount;
            newHighBidder = remainingBids[0].username;
        }
        
        await db.collection('auctions').updateOne(
            { id: auctionId },
            { 
                $set: { 
                    currentHighBid: newHighBid,
                    highestBidder: newHighBidder
                } 
            }
        );
        
        console.log(`🔄 Bid removed: ${bid.username} removed ${bid.amount} aC bid on ${auctionId}`);
        
        res.json({
            success: true,
            message: 'Bid removed and appraiCENTS refunded',
            refundedAmount: bid.amount
        });
        
    } catch (error) {
        console.error('Error removing bid:', error);
        res.json({ success: false, message: 'Error removing bid' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Mini Praisells server is running',
        timestamp: new Date().toISOString(),
        appName: CONFIG.APP_NAME,
        currency: CONFIG.CURRENCY_NAME
    });
});

// Start server
async function startServer() {
    await connectToMongoDB();
    
    app.listen(PORT, () => {
        console.log('🚀 Mini Praisells server starting...');
        console.log(`📱 Server running on port ${PORT}`);
        console.log(`🌐 Local access: http://localhost:${PORT}`);
        console.log(`💰 Virtual currency: ${CONFIG.CURRENCY_NAME} (${CONFIG.CURRENCY_SYMBOL})`);
        console.log(`🎮 Starting balance: ${CONFIG.STARTING_APPRAICENTS} ${CONFIG.CURRENCY_SYMBOL}`);
        console.log('🎨 Recreational auction platform ready!');
    });
}

startServer().catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Mini Praisells server...');
    process.exit(0);
});
