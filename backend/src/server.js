const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const app = require("./app");
const config = require("./config");

app.listen(config.port, () => {
  console.log(`Resume screening backend running on port ${config.port}`);
});
