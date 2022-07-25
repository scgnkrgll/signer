const ethers = require("ethers");
const fs = require("fs");
require("dotenv").config();

if (!process.argv[2]) {
  console.error("Please provide wallet file path");
  process.exit(1);
}

const wallets = require(`./${process.argv[2]}`);

if (!wallets) {
  console.error("Could not find wallet file");
  process.exit(1);
}

const hexPrivateKey = process.env.PRIVATE_KEY;

if (!hexPrivateKey) {
  console.error("Please provide your private key");
  process.exit(1);
}

const isFree = process.env.IS_FREE === "true";

const sign = (dataToSign, hexPrivateKey) => {
  let wallet = new ethers.Wallet(hexPrivateKey);

  // keccak256 hash of the data
  let hashData = isFree
    ? ethers.utils.solidityKeccak256(["string", "string"], [dataToSign, "FREE"])
    : ethers.utils.id(dataToSign);

  let signature = wallet.signMessage(ethers.utils.arrayify(hashData));
  return signature;
};

const signedWallets = wallets.data.map(async (addr) => ({ addr, signature: await sign(addr, hexPrivateKey) }));

Promise.all(signedWallets).then((res) => {
  fs.writeFile("./signedWallets.json", JSON.stringify(res), (err) => {
    if (err) {
      console.error(err);
    }
  });
});
