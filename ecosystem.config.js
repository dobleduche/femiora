module.exports = {
  apps: [
    {
      name: 'femiora-api',
      script: 'npm',
      args: 'run server',
      cwd: '.',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      time: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'femiora-web',
      script: 'npm',
      args: 'run preview -- --host 0.0.0.0 --port 3000',
      cwd: '.',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      time: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
