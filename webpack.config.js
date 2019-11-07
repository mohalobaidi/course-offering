const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const Terser = require('terser')
const CopyPlugin = require('copy-webpack-plugin')
const { exec } = require('child_process')

let config = theme => ({
  devtool : false,
  entry: {
    'background': './src/background.js',
    [`${theme == 'dark' ? 'dark.' : ''}main`]: [
      './src/course-offering.js',
      `./src/css/main.sass`,
    ]
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          'vue-loader',
          `vue-theme-loader?theme=${theme}`,
        ]
      },
      { test: /\.pug$/, loader: 'pug-plain-loader' },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.sass$/,
        exclude: /main\.sass/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              indentedSyntax: true,
              data:  `@import "@/themes/${theme}.sass"`
            }
          }
        ]
      },
      {
				test: /main\.sass$/,
				use: [
					{
						loader: 'file-loader',
						options: {
              name: `css/${theme == 'dark' ? 'dark.' : ''}[name].css`,
            }
					},
					'extract-loader',
					'css-loader?-url',
          {
            loader: 'sass-loader',
            options: {
              indentedSyntax: true,
              data:  `$theme: "${theme}"`
            }
          }
				]
			},
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyPlugin([
      'src/manifest.json',
      {
        from: 'src/sounds',
        to: 'sounds',
      },
      {
        from: './src/router.js',
        to: './router.js',
        transform: (fileContent, path) => {
          return Terser.minify(fileContent.toString()).code.toString()
        }
      },
      {
        from: './src/banner.js',
        to: './banner.js',
        transform: (fileContent, path) => {
          return Terser.minify(fileContent.toString()).code.toString()
        }
      },
      {
        from: 'src/icons',
        to: 'icons'
      }
    ]),
    {
      apply: (compiler) => {
        if (compiler.options.mode === 'production') {
          compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
            const { version } = require('./dist/manifest.json')
            exec(`zip -r v${version}.zip dist`, (err, stdout, stderr) => {
              if (stdout) process.stdout.write(stdout)
              if (stderr) process.stderr.write(stderr)
            })
          })
        }
      }
    }
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
          output: { comments: false }
        }
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: { discardComments: { removeAll: true } },
        canPrint: true
      })
    ]
  },
  resolve: {
    alias: {
        '@': path.join(__dirname, 'src/css'),
        '~': path.join(__dirname, 'node_modules') 
    }
 }
})

module.exports = [
  config`light`,
  config`dark`
]