// Uncomment these if you want to remove firebase and add your own custom backend:
// import authManager from './local/localAuthManager';
// export { authManager };

// Uncomment these if you want to use our mongo + nodejs custom backend:
// import authManager from './backend/authManager';
// export { authManager };

// aws auth manager
import authManager from './aws/awsAuthManager'


export { authManager }
