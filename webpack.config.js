const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HappyPack = require('happypack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const BundleTracker = require('webpack-bundle-tracker');
const happyThreadPool = HappyPack.ThreadPool({ size: 6 });
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const randomWords = require('random-words');


module.exports = {
    mode: 'production',
    entry: {
        main: './src/index.ts'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'happypack/loader?id=babel',
                    },
                ],
            },
            {
                test: /\.ts$/,
                loader: 'string-replace-loader',
                options: {
                    // -- replace multiple non-indent spaces with a single space
                    search: / {2,}/g,
                    replace: ' ',
                },
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    optimization: {
        minimizer: [new TerserPlugin({
            parallel: true,
            terserOptions: {
            compress: {
                defaults: true,
            },
            mangle: true,
        }})],
        // splitChunks: {
        //     chunks: 'all',
        //     minSize: 0,
        //     maxAsyncRequests: Infinity,
        //     maxInitialRequests: Infinity,
        //     cacheGroups: {
        //         vendor: {
        //             test: /[\\/]node_modules[\\/]/,
        //             name(module) {
        //                 const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
        //                 return `npm.${packageName.replace('@', '')}`;
        //             },
        //             chunks: 'all',
        //             enforce: true,
        //         },
        //     },
        // },
        // runtimeChunk: true,
        removeAvailableModules: false,
        removeEmptyChunks: false,
    },
    plugins: [
        new HappyPack({
            id: 'babel',
            threadPool: happyThreadPool,
            loaders: ['babel-loader?cacheDirectory=true'],
        }),
        // new BundleAnalyzerPlugin(),
        new BundleTracker({filename: './webpack_bundles/webpack-stats.json'}),
        new CleanWebpackPlugin(),
    ],
    target: 'web',
    output: {
        filename: ({ chunk: { name } }) => {
            // -- Generate the random string
            const randomString = randomWords({ 
                exactly: 3, 
                minLength: 4,
                join: '-',
                seed: name
            });

            // -- Return the filename
            return `[name].js`;
        },
        sourceMapFilename: '[name].js.map',
        path: path.resolve(__dirname, './webpack_bundles'),
    },
    devtool: 'source-map'
};