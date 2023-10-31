const isDev = process.env.NODE_ENV?.trim() === 'development'
const outputDir = process.env.OUTPUT_DIR?.trim()

const CopyWebpackPlugin = require('copy-webpack-plugin')
const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3000
  },
  publicPath: '/web', // base url
  assetsDir: 'assets',
  outputDir: outputDir || 'web-dist',
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'src/template/index.html',
      filename: 'index.html',
      title: 'Calculator',
    }
  },
  chainWebpack: config => {
    config.plugin("define")
      .tap(args => {
        args[0].BASE_HOST = JSON.stringify(isDev ? 'http://localhost:3000' : 'calc://bundle')
        return args
      })

    config.plugin('copy').use(CopyWebpackPlugin, [{
      patterns: [
        {
          from: path.join(__dirname, './src/static'),
          to: path.join(__dirname, outputDir || 'web-dist')
        }
      ]
    }])
  }
})
