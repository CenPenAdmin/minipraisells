// Configuration for Mini Praisells
const CONFIG = {
    // Server configuration
    SERVER_URL: 'https://460802c8b157.ngrok-free.app',
    
    // Virtual currency settings
    STARTING_APPRAICENTS: 1000,
    CURRENCY_NAME: 'appraiCENTS',
    CURRENCY_SYMBOL: 'aC',
    
    // Auction settings
    MIN_BID_INCREMENT: 1,
    MAX_BID_AMOUNT: 999999,
    
    // App info
    APP_NAME: 'Mini Praisells',
    APP_DESCRIPTION: 'Virtual Art Auctions with appraiCENTS',
    
    // Development mode
    DEBUG_MODE: true
};

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
