// client/vite.config.js
export default {
    server: {
      proxy: {
        '/socket.io': {
          target: 'http://localhost:3000',
          ws: true,
        },
      },
    },
  };
  