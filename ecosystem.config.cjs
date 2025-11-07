module.exports = {
  apps: [
    {
      name: 'family-calendar-api',
      cwd: './backend',
      script: 'node',
      args: 'src/index.js',
      env: {
        PORT: 4006,
        NODE_ENV: process.env.NODE_ENV || 'development'
      }
    },
    {
      name: 'family-calendar-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev -- --host 0.0.0.0 --port 5000',
      env: {
        VITE_BACKEND_PORT: 4006,
        VITE_DEV_PORT: 5000,
        NODE_ENV: process.env.NODE_ENV || 'development'
      }
    }
  ]
};
