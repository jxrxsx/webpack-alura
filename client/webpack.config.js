const path = require('path');
const babiliPlugins = require('babili-webpack-plugin');
const extractTextPlugin = require('extract-text-webpack-plugin');
const optimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const htmlWebpackPlugin = require('html-webpack-plugin');

const webpack = require('webpack');

let plugins = [];

plugins.push(new htmlWebpackPlugin({
    hash: true,
    minify: {
        html5: true,
        collapseWhitespace: true,
        removeComments: true
    },
    filename: 'index.html',
    template: __dirname + '/main.html'

}));

plugins.push(new extractTextPlugin('styles.css'));

plugins.push(
    new webpack.ProvidePlugin({
           '$': 'jquery/dist/jquery.js',
           'jQuery': 'jquery/dist/jquery.js'
    })
);

plugins.push(new webpack.optimize.CommonsChunkPlugin({
    //vendor é o bundle das bibliotecas de terceiros
    name: 'vendor',
    // nesse arquivo
    filename: 'vendor.bundle.js'
}));

let SERVICE_URL = JSON.stringify('http://localhost:3000');

if (process.env.NODE_ENV === 'production') {

    SERVICE_URL = JSON.stringify('http://endereco-da-sua-api');

    plugins.push(new webpack.optimize.ModuleConcatenationPlugin());

    
    plugins.push(new babiliPlugins());

    // optimizeCSSAssetsPlugin só é usado em produção para minificar os CSS
    plugins.push(new optimizeCSSAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorOptions: { 
            discardComments: {
                removeAll: true 
            }
        },
        canPrint: true
     }));  
}

plugins.push(new webpack.DefinePlugin({ SERVICE_URL }));

module.exports = {
    entry: {
        app: './app-src/app.js',
        vendor: ['jquery', 'bootstrap', 'reflect-metadata']
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        //pode-se remover esse publicPath pois o index.html gerado pelo webpack
        // com as importações dos bundles já estará entro da pasta dist
        // publicPath: 'dist'
    },

    module: {
        rules: [
            //cada obj é um loader
            {
                //expressão regular para informar qual é o arquivo ou extensão que ele tem que pegar
                test: /\.js$/,
                //vai pegar todos os arquivos .js, menos os que estão em node_modules
                exclude: /node_modules/,
                //informamos qual é o loader que será usado
                use: {
                    loader: 'babel-loader'
                }
            },

            { 
                test: /\.css$/, 
                use: extractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
                // loader: 'style-loader!css-loader' 
            },

            { 
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'url-loader?limit=10000&mimetype=application/font-woff' 
            },

            { 
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
            },

            { 
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'file-loader' 
            },

            { 
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'url-loader?limit=10000&mimetype=image/svg+xml' 
            }       
        ]
    },

    // short object notation do es6. Recebe a lista de plugins
    // se tiver em dev, não recebe o babili
    // se tiver em production, recebe instância do babili
    plugins
};