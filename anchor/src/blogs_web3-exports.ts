// Here we export some useful types and functions for interacting with the Anchor program.
import { address } from 'gill'
import { SolanaClusterId } from '@wallet-ui/react'
import { BLOGS_WEB3_PROGRAM_ADDRESS } from './client/js'
import BlogsWeb3IDL from '../target/idl/blogs_web3.json'

// Re-export the generated IDL and type
export { BlogsWeb3IDL }

// This is a helper function to get the program ID for the BlogsWeb3 program depending on the cluster.
export function getBlogsWeb3ProgramId(cluster: SolanaClusterId) {
  switch (cluster) {
    case 'solana:devnet':
    case 'solana:testnet':
      // This is the program ID for the BlogsWeb3 program on devnet and testnet.
      return address('6z68wfurCMYkZG51s1Et9BJEd9nJGUusjHXNt4dGbNNF')
    case 'solana:mainnet':
    default:
      return BLOGS_WEB3_PROGRAM_ADDRESS
  }
}

export * from './client/js'
