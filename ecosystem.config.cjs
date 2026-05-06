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
        // Raise V8's old-generation heap from the default ~1.5 GB so multi-image
        // car uploads (multipart body + per-file Buffer + sharp pixel scratch)
        // don't OOM. PM2's `node_args` is ignored because `script: "npm"` —
        // NODE_OPTIONS is the env hook Node honors regardless of launcher.
        NODE_OPTIONS: "--max-old-space-size=2048",
      },
    },
  ],
};
