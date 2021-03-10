module.exports = {
  apps : [{
    name: 'bot',
    script: 'node_modules/.bin/ts-node',
    args: './src/server.ts',
    watch: '.',
    max_memory_restart: '450M',
    exec_mode: 'cluster'
  }]
};