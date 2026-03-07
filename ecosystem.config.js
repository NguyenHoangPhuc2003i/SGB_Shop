module.exports = {
  apps: [
    {
      name: 'sgb-server',
      cwd: 'c:/project cá nhân/webfake/SGB_Shop',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
        // AI_PROVIDER: 'openai',
        // OPENAI_API_KEY: 'YOUR_OPENAI_KEY',
        // GEMINI_API_KEY: 'YOUR_GEMINI_KEY',
        // USERS_FILE: 'D:/data/sgb/users.json' // or a directory path like 'D:/data/sgb'
        // FIREBASE_ENABLED: 'true',
        // GOOGLE_APPLICATION_CREDENTIALS: 'D:/keys/firebase-service-account.json'
      }
    }
  ]
};