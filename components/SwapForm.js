import { useEffect, useRef, useState } from "react";
import { useMoralis } from "react-moralis";

import { ethers } from "ethers";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useRouter } from "next/router";
import { NumericFormat } from "react-number-format";

import { emailValidate } from "../utils/emailValidation";
import CurrencyDropdown from "./CurrencyDropdown";
import USDTLogo from "../assets/usdt.png";
import USDLogo from "../assets/usd.png";
import BUSDLogo from "../assets/busd.png";
import Logo from "../assets/Logoemblem.svg";

import BEP40TokenABI from "../contracts/abi/BEP40Token.json";
import YLTABI from "../contracts/abi/YLT.json";
import IUniswapV2Router02ABI from "../contracts/abi/IUniswapV2Router02.json";

import WAValidator from "multicoin-address-validator";

const _chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
const YLTtokenAddress = process.env.NEXT_PUBLIC_YLTtokenAddress;
const USDTtokenAddress = process.env.NEXT_PUBLIC_USDTtokenAddress;
const RouterAddress = process.env.NEXT_PUBLIC_RouterAddress;

const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(publishableKey);
const isBrowser = typeof window !== "undefined";
const web3Provider = isBrowser ? new ethers.providers.Web3Provider(window.ethereum) : null;

const currencies = [
  {
    id: 'USD',
    title: "USD",
    image: USDLogo,
  },
  {
    id: 'USDT',
    title: "USDT",
    image: USDTLogo,
  },
  {
    id: 'BUSD',
    title: "BUSD",
    image: BUSDLogo,
  },
];

export default function SwapForm({ setIsLoading }) {
  // input values
  const [usdAmount, setUsdAmount] = useState(0.0);
  const [ylt, setYlt] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0].id);
  const [walletAddress, setWalletAddress] = useState({
    value: "",
    isValid: false,
  });
  const [email, setEmail] = useState("");
  // rates
  const [rate, setRate] = useState(0.0);
  const [srate, setStripeRate] = useState(0);
  // balances
  const [yltBalance, setYltBalance] = useState(0);
  const [usdtBalance, setUsdtBalance] = useState(0);
  // moralis
  const { user, isAuthenticated, Moralis } = useMoralis();
  const [chainId, setChainId] = useState(web3Provider.network?.chainId);
  // etc
  const router = useRouter();
  // current network

  const item = useRef({
    name: "YL Token",
    description: "Latest Apple AirPods.",
    image: appUrl + "/assets/LogoYLGWhite.png",
    quantity: 1,
    price: 9,
    email: "",
    address: "",
    amount: "",
    token: "",
  });

  // when mounted, initialize web3 modules
  function updateChainId(network) {
    setChainId(network.chainId);
  }
  useEffect(() => {
    if (!isBrowser) return; // do nothing
    // monitor network change --> to update chainId
    web3Provider.on('network', updateChainId);

    return () => {
      web3Provider.removeListener('network', updateChainId);
    }
  }, []);

  useEffect(() => {
    async function getBalanceAsync() {
      await getBalance();
      const value = await Moralis.Cloud.run("getStripeRate");
      setStripeRate(value?.attributes.rate);
    };

    getBalanceAsync();
  }, [isAuthenticated, chainId]);

  useEffect(() => {
    refreshRate();
  }, [chainId]);

  useEffect(() => {
    async function func() {
      const { status, token, timestamp } = router.query;
      setIsLoading(true);

      if (
        status == "success" &&
        token?.length > 100 &&
        timestamp?.length > 20
      ) {
        await Moralis.Cloud.run("saveTokenSwap", {
          email: item.current.email,
          address: item.current.address,
          tokenAmount: item.current.amount.toString(),
          yltAmount: item.current.price.toString(),
          tokenType: 2,
          token: token,
          state: 0,
        });

        await axios
          .post(
            "api/posts/stripeSuccess",
            {
              status: status,
              timestamp: token,
            },
            {
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
      }

      if (token?.length > 20) {
        if (localStorage.getItem(process.env.NEXT_PUBLIC_localStorage) == undefined) {
          const result = await Moralis.Cloud.run("getUserById", { id: token });
          localStorage.setItem(
            process.env.NEXT_PUBLIC_localStorage,
            JSON.stringify(result)
          );
          setEmail(result?.attributes.email);
          router.push("/"); // remove token and other things ...
          location.reload(); // because react doesn't rerender components if not changed
        }
      } else
        setIsLoading(false);
    }
    func();
  }, [router.isReady]);

  const addEmail = async () => {
    const { id } = user;
    await Moralis.Cloud.run("addEmail", { id, email });
  };

  const canSwap = () => {
    if (selectedCurrency == 'USD' && usdAmount < 0.6) return false;
    if (ylt <= 0 || usdAmount <= 0) return false;
    if (!ylt && !usdAmount) return false;
    if (user && !user?.attributes.email && !email) return false;
    if (email && !emailValidate(email)) return false;
    if (user && !user?.attributes.ethAddress && !walletAddress.isValid) return false;
    return true;
  };

  // swaps
  async function initSwap() {
    if (chainId != _chainId) return;

    setIsLoading(true);
    if (isAuthenticated && email) {
      await addEmail();
    }

    const amountOutMin = 0;
    const amountIn = usdAmount;
    const path = [USDTtokenAddress, YLTtokenAddress];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    let to = null;
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      to = accounts[0];
    } catch (err) {
      setIsLoading(false);
      return;
    }

    let metaSigner = web3Provider.getSigner(to);

    // contract and its abi
    const RouterContract = new ethers.Contract(
      RouterAddress,
      IUniswapV2Router02ABI.abi,
      metaSigner
    );
    const USDTContract = new ethers.Contract(
      USDTtokenAddress,
      BEP40TokenABI,
      metaSigner
    );

    let tx = await USDTContract.approve(
      RouterAddress,
      ethers.utils.parseUnits(Number(amountIn).toString(), 18)
    );
    await tx.wait();

    // transaction to carry
    tx = await RouterContract.swapExactTokensForTokens(
      ethers.utils.parseUnits(Number(amountIn).toString(), 18),
      amountOutMin,
      path,
      to,
      deadline
    );
    await tx.wait();

    await getBalance();

    await Moralis.Cloud.run("saveTokenSwap", {
      email: !user?.attributes.email ? email : user?.attributes.email,
      address: to,
      tokenAmount: usdAmount.toString(),
      yltAmount: ylt.toString(),
      tokenType: 1,
      state: 1,
    });

    setIsLoading(false);
    // MetaMask requires requesting permission to connect users accounts
    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
  }

  const createCheckoutSession = async () => {
    if (chainId != _chainId) return;

    setIsLoading(true);

    let to = null;
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      to = accounts[0];
    } catch (err) {
      setIsLoading(false);
      return;
    }

    stripePromise.then((stripe) => {
      item.current.price = usdAmount;
      item.current.address = to;
      item.current.amount = ylt;
      item.current.email = !user?.attributes.email ? email : user?.attributes.email;
      item.current.token = user?.id;
      axios
        .post(
          "/api/posts/create-checkout-session",
          { item: item.current },
          {
            headers: {
              "Access-Control-Allow-Origin": "*",
            }
          }
        )
        .then((checkoutSession) => {
          stripe
            .redirectToCheckout({ sessionId: checkoutSession.data.id })
            .then((result) => {
              if (result.error) {
                alert(result.error.message);
              }
            });
        })
        .catch((err) => {
          setIsLoading(false);
        });
    });
  };

  // etc
  const refreshRate = async () => {
    if (!isBrowser) return;
    if (chainId != _chainId) return;
    let to = null;

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      to = accounts[0];
    } catch (err) {
      return; // finish function
    }

    const metaSigner = web3Provider.getSigner(to);

    const routerContract = new ethers.Contract(
      RouterAddress,
      IUniswapV2Router02ABI.abi,
      metaSigner
    );
    const swapAmount = ethers.utils.parseUnits("1", 18);
    const amountsOut = await routerContract.getAmountsOut(
      swapAmount.toString(),
      [USDTtokenAddress, YLTtokenAddress]
    );
    const currentRate = ethers.utils.formatEther(amountsOut[1]);

    setRate(Number.parseFloat(currentRate).toFixed(6));
  };

  const getBalance = async () => {
    if (chainId != _chainId) return;

    let to = null;
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      to = accounts[0];
    } catch (err) {
      return;
    }

    const YLTContract = new ethers.Contract(
      YLTtokenAddress,
      YLTABI,
      web3Provider
    );
    const balance = await YLTContract.balanceOf(to);
    setYltBalance(balance.toString() / 10 ** 18);

    const USDTContract = new ethers.Contract(
      USDTtokenAddress,
      BEP40TokenABI,
      web3Provider
    );
    const usdtBalance = await USDTContract.balanceOf(to);
    setUsdtBalance(usdtBalance.toString() / 10 ** 18);
  };

  // events
  const handleWalletChange = (value) => {
    setWalletAddress({
      value,
      isValid: WAValidator.validate(value, "BNB"),
    });
  };

  const handleChangeCurrency = (currencyId) => {
    if (currencyId == 'USD')
      setYlt(Number.parseFloat(usdAmount * srate).toFixed(6));
    else
      setYlt(Number.parseFloat(usdAmount * rate).toFixed(6));
    setSelectedCurrency(currencyId);
  };

  const handleUsdAmount = (value) => {
    if (value < 0) value = 0;
    setUsdAmount(value);
    if (selectedCurrency == 'USD')
      setYlt(value * srate);
    else
      setYlt(value * rate);
  };

  const handleYLTAmount = (value) => {
    if (value <= 0) {
      value = 0;
      setYlt(0);
      setUsdAmount(0);
    } else {
      setYlt(value);
      if (selectedCurrency == 'USD')
        setUsdAmount(Number(srate) ? value / srate : 0);
      else
        setUsdAmount(Number(rate) ? value / rate : 0);
    }
  };

  return (
    <div className="sm:max-w-screen-sm sm:w-full bg-white relative mx-3 flex flex-col border-2 border-[#90e040] rounded-2xl pt-3 pb-5 px-2.5 my-10">
      <div className="relative flex flex-col text-5xl mb-7">
        <div className="relative w-full">
          <div className="absolute right-5 top-2/4 -translate-y-2/4 flex flex-col items-end z-[10]">
            <CurrencyDropdown
              options={currencies}
              selectedId={selectedCurrency}
              onChange={handleChangeCurrency}
            />
            {isAuthenticated && selectedCurrency === 'USDT' && (
              <p className="mt-4 text-sm">Balance: {usdtBalance.toFixed(2)} </p>
            )}
          </div>
          <NumericFormat
            placeholder="Enter amount"
            value={usdAmount}
            thousandSeparator={true}
            decimalScale={6}
            onValueChange={(values, sourceInfo) => {
              handleUsdAmount(values.floatValue);
            }}
            className="form-input h-[100px] text-2xl sm:text-3xl"
          />
        </div>
        <div className="relative w-full">
          <div className="absolute flex flex-col items-end right-5 top-2/4 -translate-y-2/4">
            <div className=" py-1.5 px-2.5 w-[134px] flex items-center rounded-3xl bg-[#C3EB9B]">
              <Logo className="h-6 w-6 mr-1.5" />
              <span className="text-2xl">YLT</span>
            </div>
            {isAuthenticated && (
              <p className="mt-4 text-sm">Balance: {yltBalance.toFixed(2)} </p>
            )}{" "}
          </div>
          <NumericFormat
            placeholder="YLT Token Amount"
            value={ylt}
            thousandSeparator={true}
            decimalScale={6}
            onValueChange={(values, sourceInfo) => {
              handleYLTAmount(values.floatValue);
            }}
            className="form-input mt-2 w-full h-[100px] text-2xl sm:text-3xl"
          />
        </div>
      </div>
      {!user?.attributes.ethAddress && (
        <>
          <label
            htmlFor="walletAddress"
            className="mt-5 w-[97%] mx-auto text-gray-500 text-xs"
          >
            Your wallet must be BEP-20 compatible
          </label>
          <input
            id="walletAddress"
            type="text"
            placeholder="Enter your crypto wallet address"
            value={walletAddress.value}
            onChange={(e) => handleWalletChange(e.target.value)}
            className={`form-input font-normal text-lg ${walletAddress.value.length > 0
              ? walletAddress.isValid
                ? "border-2 border-green-500"
                : "border-2 border-red-500"
              : ""
              }`}
          />
        </>
      )}
      {!user?.attributes.email && (
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-lg font-normal form-input"
        />
      )}
      {user?.attributes.ethAddress && (
        <>
          <div className="pl-3">
            You will get your YLT tokens to this wallet Address
          </div>
          <input
            type="text"
            disabled
            value={user?.attributes.ethAddress}
            className="text-lg font-normal form-input"
          />
        </>
      )}
      {selectedCurrency !== 'USD' && rate > 0 && (
        <button
          type="button"
          className="self-end mt-4 bg-transparent"
          onClick={refreshRate}
        >
          1$/{rate}- update rate <span className="text-blue-500">&#8635;</span>
        </button>
      )}
      {selectedCurrency == 'USD' ? (
        <>
          <button
            onClick={createCheckoutSession}
            type="submit"
            className="w-full h-16 rounded-3xl bg-[#90e040] border-none text-4xl text-white mx-auto mt-7 disabled:bg-gray-300 disabled:text-gray-200"
            disabled={!canSwap()}
          >
            Swap From Fiat ($)
          </button>
        </>
      ) : (
        <button
          onClick={initSwap}
          type="submit"
          className="w-full h-16 rounded-3xl bg-[#546ADA] border-none text-4xl text-white mx-auto mt-7 disabled:bg-gray-300 disabled:text-gray-200"
          disabled={!canSwap()}
        >
          Swap From Crypto
        </button>
      )}
    </div>
  );
}

/*
  async function secondSwap() {
    setIsLoading(true);
    if (isAuthenticated && email) {
      await addEmail();
    }

    const amountOutMin = 0;
    const amountIn = ylt;
    const path = [YLTtokenAddress, USDTtokenAddress];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    let to = null;
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      to = accounts[0];
    } catch (err) {
      setIsLoading(false);
      return;
    }

    const metaSigner = web3Provider.getSigner(to);

    // contract and its abi
    const RouterContract = new ethers.Contract(
      RouterAddress,
      IUniswapV2Router02ABI.abi,
      metaSigner
    );
    const YLTContract = new ethers.Contract(
      YLTtokenAddress,
      YLTABI,
      metaSigner
    );
    let tx = await YLTContract.approve(
      RouterAddress,
      ethers.utils.parseUnits(Number(amountIn).toString(), 18)
    );
    await tx.wait();

    // transaction to carry
    tx = await RouterContract.swapExactTokensForTokens(
      ethers.utils.parseUnits(Number(amountIn).toString(), 18),
      amountOutMin,
      path,
      to,
      deadline
    );
    await tx.wait();
    await getBalance();
    setIsLoading(false);
    // MetaMask requires requesting permission to connect users accounts
    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
  }
*/