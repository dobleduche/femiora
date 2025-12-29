module.exports = {
    apps: [
      {
        name: '68f0a225657e899e98d8ea52-server',
        script: 'npm',
        args: 'run dev',
        cwd: './server',
        instances: 1,
        exec_mode: 'fork',
        autorestart: true,
        watch: true,
        time: true
      },
      {
        name: '68f0a225657e899e98d8ea52-client',
        script: 'npm',
        args: 'start',
        cwd: './client',
        instances: 1,
        exec_mode: 'fork',
        autorestart: true,
        watch: false,
        time: true
      }
    ]
  };