module.exports = {
  apps: [
    {
      name: 'nexus-watch',
      script: 'pnpm',
      args: '--filter @apps/app-tui run watch',
      cwd: __dirname,
      exec_mode: 'cluster',
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/tmp/nexus-watch-err.log',
      out_file: '/tmp/nexus-watch-out.log',
      merge_logs: true,
    },
  ],
};
