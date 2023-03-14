const Moralis = require("moralis-v1/node");
const CryptoJS = require('crypto-js');
import { ethers } from "ethers";

import YLTABI from '../../../contracts/abi/YLT.json';

const YLTtokenAddress = process.env.NEXT_PUBLIC_YLTtokenAddress;


export default async function handle(req, res) {
  const env = {
    APP_ID: process.env.NEXT_PUBLIC_APP_ID,
    APP_SERVER_URL: process.env.NEXT_PUBLIC_APP_SERVER_URL,
    APP_MASTER_KEY: process.env.NEXT_PUBLIC_PRIVATE_APP_MASTER_KEY
  }

  if (req.method === 'POST') {
    let { status, timestamp } = req.body;
    timestamp = timestamp.replace(/ /g, '+');
    await Moralis?.start({ serverUrl: env.APP_SERVER_URL, appId: env.APP_ID, masterKey: env.APP_MASTER_KEY })
    if (status != "success" || timestamp.length < 100)
      res.status(500).json({ msg: "Internal Server Error!!!" });

    const passphrase = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;
    const bytes = CryptoJS.AES.decrypt(timestamp, passphrase);
    const decode = bytes.toString(CryptoJS.enc.Utf8);

    let token = decode.substr(32, 64);

    let id,
      address,
      amount;
    const res = await Moralis.Cloud.run("getTempFile", { token })
    id = res.id;
    address = res.attributes.address;
    amount = res.attributes.token_amount;

    if (id == null || id == undefined || address == null || address == undefined || amount == null || amount == undefined)
      res.status(500).json({ msg: 'Internal Server Error!!!' });

    await Moralis.Cloud.run("deleteTempFile", { id: id });

    const privateKey = process.env.NEXT_PUBLIC_MARKETING_PRIVATE_KEY;

    let wallet = new ethers.Wallet(privateKey);

    // Connect a wallet to mainnet
    let provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_SERVER_URL);

    let walletWithProvider = new ethers.Wallet(privateKey, provider);

    const YLTContract = new ethers.Contract(YLTtokenAddress, YLTABI, walletWithProvider);
    let tx = await YLTContract.transfer(address, ethers.utils.parseUnits(Number(amount).toString(), 18));
    await tx.wait();

    const swapTokenLog = await Moralis.Cloud.run("getSwapTokenLogByToken", { token })
    await Moralis.Cloud.run("updateSwapTokenLog", { objectId: swapTokenLog.id, state: 1 });

    res.status(200).json({ msg: 'success' });
  }
}
