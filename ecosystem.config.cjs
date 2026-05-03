/** @see https://pm2.keymetrics.io/docs/usage/application-declaration/ */
module.exports = {
  apps: [
    {
      name: "automerkado",
      cwd: __dirname,
      script: "npm",
      args: "run start",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
