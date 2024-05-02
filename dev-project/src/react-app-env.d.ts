/// <reference types="react-scripts" />
import type { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window{
    ethereum?:MetaMaskInpageProvider
  }

  interface NFT {
    tokenId: number;
    color: string;
  }
}