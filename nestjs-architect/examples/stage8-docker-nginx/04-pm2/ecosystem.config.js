module.exports = {
  apps: [
    {
      name: 'nestjs-api',
      script: 'dist/main.js',
      cwd: './',
      instances: 2,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch_restart: 5000,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
    },
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: '43.167.209.167',
      ref: 'origin/master',
      repo: 'git@github.com:FlyCloud1006/rbac-project.git',
      path: '/var/www/nestjs-api',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env production',
    },
  },
};
