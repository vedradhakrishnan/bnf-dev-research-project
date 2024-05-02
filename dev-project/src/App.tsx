import React, { useState, useEffect } from 'react';
import './App.css';
import { BigNumberish, ethers } from "ethers";

import type { MetaMaskInpageProvider } from "@metamask/providers";

import ContractAbi from './abis/MyToken.json';
import NFTAbi from './abis/MyNFT.json'



function App() {
  const [number, setNumber] = useState(0); //amount to transact
  const [address, setAddress] = useState(''); // User's wallet address
  const [balance, setBalance] = useState('0'); // User's token balance

  // const [receiverAddress, setReceiverAddress] = useState(''); // Address of NFTReceiver contract
  const [transferStatus, setTransferStatus] = useState(''); // To display transfer status messages
  const [nftData, setNFTData] = useState<NFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null); 


  const myTokenAddress = "0x5Dd7A2eEe39e950C11B54dE64Bdbc1BbF24C9A88";
  const myNFTAddress = "0x25206de7911460dC55284B2A6fe0D74c84A725a2";
  const dAppAddress = "0x4054b1172b1f8a2f8fbcbd6bae0bb4accfe29ddb";
  // const nftReceiverAddress = "Your_NFTReceiver_Contract_Address"

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
    // const balance = await contract.balanceOf(account);
    // console.log(balance, typeof balance)
    // setBalance(ethers.formatEther(balance)); 
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
    // console.log(nftBalance)

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
    }, 500); // specify the interval time in milliseconds

    // Clear the interval when the component unmounts or when address changes
    return () => clearInterval(intervalId);
  }
}, [address]); // Refetch when address changes

const handleCircleClick = (tokenId: number, color: string) => {
  console.log(tokenId, color)
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
        <p>Connected Address: {address}</p>
        <p>Units: {balance}</p>
        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(Number(e.target.value))}
          placeholder="Enter amount to transfer"
        />
        <button onClick={transferTokens}>Transfer Units</button>

        <h2>Owned NFTs:</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {nftData.map((nft, index) => (
            <div key={index} style={{ margin: '10px' }}>
              <div
                style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: nft.color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                onClick={() => handleCircleClick(nft.tokenId, nft.color)}
              >
                <p style={{ color: 'white' }}>{nft.tokenId + ""}</p>
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
