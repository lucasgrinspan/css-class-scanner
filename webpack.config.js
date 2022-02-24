import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  entry: "./src/extension/background.js",
  output: {
    filename: "background.js",
    path: resolve(__dirname, "dist"),
  },
  externals: {
    "node-fetch": "fetch",
  },
  resolve: {
    fallback: {
      // 'css' package uses some node library functions
      url: false,
      fs: false,
      path: false,
    },
  },
  mode: "development",
  devtool: "cheap-module-source-map",
};
