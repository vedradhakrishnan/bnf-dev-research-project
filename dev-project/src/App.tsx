import React, { useState, useEffect } from 'react';
import './App.css';
import { BigNumberish, ethers } from "ethers";

import type { MetaMaskInpageProvider } from "@metamask/providers";

import ContractAbi from './abis/MyToken.json';
import NFTAbi from './abis/MyNFT.json'



function App() {
  const [number, setNumber] = useState(0); //amount to transact
  const [address, setAddress] = useState(''); // user's wallet address
  const [balance, setBalance] = useState('0'); // user's token balance

  const [transferStatus, setTransferStatus] = useState(''); // for debugging
  const [nftData, setNFTData] = useState<NFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null); 


  const myTokenAddress = "0x5Dd7A2eEe39e950C11B54dE64Bdbc1BbF24C9A88";
  const myNFTAddress = "0x25206de7911460dC55284B2A6fe0D74c84A725a2";
  const dAppAddress = "0x4054b1172b1f8a2f8fbcbd6bae0bb4accfe29ddb";


  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access if needed
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];;
            if (accounts == null || accounts.length === 0) {
              console.error('No account found');
              return;
            }
            const account = accounts[0];
            setAddress(account);
            console.log('Connected account:', account);
        } catch (error) {
            console.error('User denied account access:', error);
        }
    } else {
        console.error('MetaMask is not installed!');
    }
  }

  async function transferTokens() {
    if (!window.ethereum) return console.error('MetaMask is not installed!');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    // console.log(signer, typeof signer)
    const tokenContract = new ethers.Contract(myTokenAddress,ContractAbi, signer);

    try {
      const txResponse = await tokenContract.transfer(dAppAddress, number);
      await txResponse.wait();
      // await fetchBalance
      setTransferStatus('Transfer successful!');
    } catch (error) {
      console.error('Transfer failed:', error);
      setTransferStatus('Transfer failed!');
    }
  }

  async function transferNFT() {
    if (!window.ethereum) return console.error('MetaMask is not installed!');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(myNFTAddress,NFTAbi, signer);

    try {
      if (!selectedNFT) {
        console.error('No NFT selected for transfer');
        return;
      }

      const txResponse = await tokenContract.transferFrom(address, dAppAddress, selectedNFT.tokenId);
      await txResponse.wait();

      // Update transfer status
      setTransferStatus('NFT transfer successful!');
    } catch (error) {
      console.error('NFT Transfer failed:', error);
      setTransferStatus('NFT Transfer failed!');
    }
  }

  async function fetchBalance(account: string) {
    if (!window.ethereum) return console.error('MetaMask is not installed!');

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(myTokenAddress, ContractAbi, provider);
    try {
     
      const balance: BigNumberish = await contract.balanceOf(account);
      const balanceString = balance.toString(); // Convert BigNumber to string
      const balanceFormatted = ethers.formatUnits(balanceString, 0); 
      setBalance(balanceFormatted); 
    } catch (error) {
      console.error("Failed to fetch balance: ", error);
    }
  }

  async function fetchNFT(account: string) {
    if (!window.ethereum) return console.error('MetaMask is not installed!');

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(myNFTAddress, NFTAbi, provider);
    try {
      const nftBalance = await contract.balanceOf(address);

      const data: NFT[] = [];
      for (let i = 0; i < Number(nftBalance); i++) {
          try {
              const nftID = await contract.tokenOfOwnerByIndex(address, i);
              const nftColor = await contract.getTokenColor(nftID)
              // console.log(nftID, nftColor)
              data.push({tokenId:nftID, color:nftColor});
          } catch (tokenIdError) {
              console.error(`Failed to fetch token at index ${i}:`, tokenIdError);
          }
      }

      setNFTData(data);
    } catch (error) {
      console.error("Failed to fetch balance: ", error);
    }
  }

  useEffect(() => {
    if (address) {
      const intervalId = setInterval(() => {
        fetchBalance(address);
        fetchNFT(address);
      }, 500); // interval time

      
      return () => clearInterval(intervalId);
    }
  }, [address]);

  const handleCircleClick = (tokenId: number, color: string) => {
    setSelectedNFT({ tokenId, color });
  };

  return (
    <div className="App">
      {!address ? (
        <>
          <h1>Connect to Wallet</h1>
          <button onClick={connectWallet}>Connect Wallet</button>
        </>
      ) : (
        <>
          <h1>BnF Mentorship DApp</h1>
          <p>Connected Address: {address.substring(0, 7)}... {address.substring(address.length - 5)}</p>
          <p>Owned Units: {balance}</p>
          <input
            type="text"
            pattern="[0-9]*"
            value={number}
            onChange={(e) => {
              const inputValue = Number(e.target.value);
              setNumber(inputValue);
            }}
      
            placeholder="Enter amount to transfer"
          />
          <button onClick={transferTokens}>Transfer Units</button>

          <h2>Owned NFTs:</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {nftData.map((nft, index) => (
              <div key={index} style={{ margin: '10px' }}>
                <div
                  className={`nft-circle ${selectedNFT && selectedNFT.tokenId === nft.tokenId ? 'selected' : ''}`}
                  style={{ backgroundColor: nft.color }}
                  onClick={() => handleCircleClick(nft.tokenId, nft.color)}
                >
                  <p style={{ color: 'white', margin: 0 }}>{nft.tokenId + ""}</p>
                </div>
              </div>
            ))}
          </div>
          {selectedNFT && (
            <>
              <p>Selected NFT ID: {selectedNFT.tokenId + ""}</p>
              <p>Selected NFT Color: {selectedNFT.color}</p>
              <button onClick={transferNFT}>Transfer Selected NFT</button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
