export default {
  apps: [{
    name: 'fotobudka-ogeventspot',
    script: 'server.js',
    cwd: '/var/www/fotobudka-ogeventspot.pl/public_html',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
