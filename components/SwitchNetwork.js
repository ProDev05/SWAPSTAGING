import { useMoralis } from "react-moralis";
import { useState, useEffect } from "react";
import { bscTestnet, mainnet, polygon } from "@wagmi/chains";
import Web3 from 'web3'

export default function SwitchNetwork() {
  const web3 = new Web3(window.ethereum)

  const [currentChainId, setCurrentChainId] = useState();
  const [selectedChainId, setSelectedChainId] = useState(
    process.env.NEXT_PUBLIC_CHAIN_ID || numberToHex(1)
  );

  console.log('selected chain id', selectedChainId);

  const { Moralis, user, logout, isAuthenticated } = useMoralis();
  const chains = [bscTestnet, mainnet, polygon];

  useEffect(() => {
    if (isAuthenticated && currentChainId !== selectedChainId) {
      switchNetwork();
    }
  }, [isAuthenticated, selectedChainId]);

  const changeSelectedChainId = (evt) => {
    setSelectedChainId(numberToHex(evt.target.value));
  };

  const switchNetwork = async () => {
    try {
      await web3.currentProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: numberToHex(selectedChainId) }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        // let newNetwork = {};

        chains.map(async (chain) => {
          if (chain.id == selectedChainId) {
            await web3.currentProvider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: numberToHex(selectedChainId),
                  chainName: chain.name,
                  nativeCurrency: {
                    name: chain.nativeCurrency.name,
                    symbol: chain.nativeCurrency.symbol,
                    decimals: chain.nativeCurrency.decimals,
                  },
                  rpcUrls: chain.rpcUrls.default.http,
                  blockExplorerUrls: [chain.blockExplorers.default.url],
                },
              ],
            });
          }
        });

        console.warn("Not working on this network. Please use another network");
      }
    }
  };

  function numberToHex(number) {
    return web3.utils.toHex(number)
  }

  window.ethereum.on('chainChanged', (chainId) => {
    setSelectedChainId(numberToHex(chainId));
  });

  return (
    <div>
      <select
        id="countries"
        value={selectedChainId}
        onChange={(evt) => changeSelectedChainId(evt)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        {chains.map((chain) => (
          <option key={chain.id} value={numberToHex(chain.id)} className="p-7">
            {chain.name}
          </option>
        ))}
      </select>
    </div>
  );
}
