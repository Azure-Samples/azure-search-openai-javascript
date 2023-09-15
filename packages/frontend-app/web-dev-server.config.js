// this is a default config for web-dev-server with watch and open options
// https://modern-web.dev/docs/dev-server/overview/
export default {
  open: false,
  watch: true,
  appIndex: 'index.html',
  nodeResolve: {
    exportConditions: ['development'],
  },
};