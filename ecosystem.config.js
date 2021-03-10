module.exports = {
  apps : [{
    name: 'bot',
    script: './src/server.ts',
    watch: '.',
    max_memory_restart: '450M'
  }]
};