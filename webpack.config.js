const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  mode: 'development',
  entry: './client/index.tsx',
  output: {
    path: path.resolve(__dirname, "dist"), // the bundle output path
    filename: "bundle.js", // the name of the bundle
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/, // .js and .jsx files
        exclude: /node_modules/, // excluding the node_modules folder
        use: ['ts-loader'],
      },
      {
        test: /\.(sa|sc|c)ss$/, // styles files
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./client/index.html", // to import index.html file inside index.ts
    }),
  ],
  devServer: {
    historyApiFallback: true
  },
};
