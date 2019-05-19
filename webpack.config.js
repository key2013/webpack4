
const path = require('path');
const webpack = require('webpack')
let HtmlWebpackPlugin = require('html-webpack-plugin');
// 拆分css样式的插件
let MiniCssExtractPlugin = require('mini-css-extract-plugin');

let CleanWebpackPlugin = require('clean-webpack-plugin');
const glob = require('glob');
const PurifyCSSPlugin = require("purifycss-webpack");
const uglify = require('uglifyjs-webpack-plugin');
const DropConsoleWebpackPlugin = require('drop-console-webpack-plugin')
module.exports = {
     // 入口文件
    entry:{
        index:'./src/pages/index/index.js',
        login:'./src/pages/login/index.js'
    },
    // 出口文件
    output:{
        filename:'static/js/[name]/[name].js',// 打包后的文件名称
        path:path.resolve(__dirname,'./dist')// 打包后的目录，必须是绝对路径
    },
    // 处理对应模块
    module: {
        rules:[
            {
                test: /\.css$/,     // 解析css
                use: [
                    MiniCssExtractPlugin.loader,
                    {loader : 'css-loader'},
                    {loader : 'postcss-loader'}
                    
                ],
                exclude:/node_modules/
            },
            {
                test: /\.less$/,     // 解析css
                use: [
                    MiniCssExtractPlugin.loader,
                    {loader : 'css-loader'},
                    {loader : 'less-loader'},
                    {loader : 'postcss-loader'}
                ],
                exclude:/node_modules/
            },
            //引用图片
            {
                test: /\.(jpe?g|png|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            //name: '[name].[ext]',
                            limit: 8192,    // 小于8k的图片自动转成base64格式，并且不会存在实体图片
                            outputPath: 'static/images/'   // 图片打包后存放的目录
                        }
                    },
                    {	//压缩图片要在file-loader之后使用
                        loader:'image-webpack-loader',
                        options:{
                            bypassOnDebug: true
                        }
                    }
    
                ]
            },
            //页面img引用图片
            {
                test: /\.(htm|html)$/,
                use: 'html-withimg-loader'
            },
            //引用字体图片和svg图片
            {
                test: /\.(eot|ttf|woff|svg)$/,
                use: 'file-loader'
            },
            {
                test:/\.(jsx|js)$/,
                include:'/src/',
                use:{
                    loader:'babel-loader',
                    options:{
                       
                    }
                },
                exclude:/node_modules/
            }
        ]
    },   
    // 对应的插件           
    plugins: [
        // 通过new一下这个类来使用插件
        new HtmlWebpackPlugin({
            // 用哪个html作为模板
            // 在src目录下创建一个index.html页面当做模板来用
            template: './src/pages/index/index.html',
            filename:'pages/index/index.html',
            chunks:["vendor","index"],
            hash: true, // 会在打包好的bundle.js后面加上hash串
        }),
        // 通过new一下这个类来使用插件
        new HtmlWebpackPlugin({
            // 用哪个html作为模板
            // 在src目录下创建一个index.html页面当做模板来用
            template: './src/pages/login/index.html',
            filename:'pages/login/index.html',
            chunks:["vendor","login"],
            hash: true, // 会在打包好的bundle.js后面加上hash串
        }),
        //css抽离
        new MiniCssExtractPlugin({
            filename: "static/css/[name]/[name].css",
        　  //chunkFilename: "./src/**/**/[id].css"
        }),
        new webpack.ProvidePlugin({
            $:'jquery'
        }),
         // 打包前先清空
         //new CleanWebpackPlugin(path.resolve(__dirname,"./dist")) ,
         //消除未使用的CSS
         new PurifyCSSPlugin({
            paths:glob.sync(path.resolve(__dirname,'src/pages/**/*.html'))
         }),
         //js脚本压缩
         new uglify(),
         //热更新
         new webpack.HotModuleReplacementPlugin(),
         //new DropConsoleWebpackPlugin({drop_log:process.env.NODE_ENV === "production" }),    //限制生产环境
         new DropConsoleWebpackPlugin(),   //不做环境限制,  
    ],        
    // 开发服务器配置     
    devServer: {
        contentBase: './dist',
        host: 'localhost',      // 默认是localhost
        port: 3000,             // 端口
        open: true,             // 自动打开浏览器
        hot: true               // 开启热更新
    },  
    resolve:{
        // 别名
        alias: {
          //  $: './src/jquery.js'
        },
        // 省略后缀
        extensions: ['.js', '.json', '.css']
    },
     // 模式配置         
    mode: 'development',    
    // 提取公共代码
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {   // 抽离第三方插件
                    test: /node_modules/,   // 指定是node_modules下的第三方包
                    chunks: 'initial',
                    name: 'vendor',  // 打包后的文件名，任意命名  
                    filename:'static/libs/[name].js',  
                    // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
                    priority: 10    
                },
                // utils: { // 抽离自己写的公共代码，utils这个名字可以随意起
                //     chunks: 'initial',
                //     name: 'utils',  // 任意命名
                //     filename:'static/libs/[name].js',  
                //     minSize: 0    // 只要超出0字节就生成一个新包
                // }
            }
        },
        //
        minimizer:[
           
        ]
    },
    //watch的配置
    watchOptions:{
        //检测修改的时间，以毫秒为单位
        poll:1000, 
        //防止重复保存而发生重复编译错误。这里设置的500是半秒内重复保存，不进行打包操作
        aggregateTimeout:500, 
        //不监听的目录
        ignored:/node_modules/, 
    }
}