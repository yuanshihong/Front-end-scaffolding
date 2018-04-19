module.exports = {
  base: {
    assetsPath: 'static'
  },
  dev: {
    env: 'development',
    publicPath: '/',
    host: 'localhost',
    port: '9999',
    assetsPath: 'static',
    devtool: 'source-map',
    proxyTable: {}
  },
  build: {
    env: 'production',
    publicPath: './',
    assetsPath: 'static',
    productionSourceMap: true,
    devtool: '#source-map',
    productionGzip: false,
    productionGzipExtensions: ['js', 'css']
  }
}