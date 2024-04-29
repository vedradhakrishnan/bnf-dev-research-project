const path = require("path");
const fs = require("fs");
const solc = require("solc");

const lotteryPath = path.resolve(__dirname, "contracts", "contract-a5c9da8716.sol");
const source = fs.readFileSync(lotteryPath, "utf8");


//compile and export
module.exports = solc.compile(source, 1).contracts[":contract-a5c9da8716.sol"];
