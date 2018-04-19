const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('../config')
const webpackConfig = require('./webpack.dev.conf')
const path = require('path')
const opn = require('opn')
const ora = require('ora')

const compiler = webpack(webpackConfig)
const spinner = ora('Compiler is running...').start()
compiler.plugin('done', () => {
  if (!global.rebuild) {
    spinner.stop()
    console.log('🖥  Dev Server Listening at http://localhost:9999/')
    opn(`http://localhost:${config.dev.port}`)
    global.rebuild = true
  }
})

new WebpackDevServer(compiler, {
  contentBase: path.normalize(path.resolve(__dirname + '/../dist')),
  publicPath: config.dev.publicPath,
  hot: true,
  historyApiFallback: true,
  quiet: true,
  noInfo: false,
  stats: {
    assets: false,
    colors: true,
    version: true,
    hash: true,
    timings: true,
    chunks: true,
    chunkModules: false
  }
}).listen(config.dev.port, 'localhost', function (err) {
  if (err) {
    return console.log(err)
  }
})