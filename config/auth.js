module.exports = {
    'facebookAuth': {
        'clientID': '144987575833681', // your App ID
        'clientSecret': '4f55a6e26be37c16f802b560cd017457', // your App Secret
        'callbackURL': 'http://localhost:3000/api/auth/facebook/callback'
    },

    'twitterAuth': {
        'consumerKey': 'your-consumer-key-here',
        'consumerSecret': 'your-client-secret-here',
        'callbackURL': 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth': {
        'clientID': 'your-secret-clientID-here',
        'clientSecret': 'your-client-secret-here',
        'callbackURL': 'http://localhost:8080/auth/google/callback'
    }
};