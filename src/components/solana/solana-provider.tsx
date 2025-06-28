'use client'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'
import { createSolanaDevnet, createSolanaLocalnet, createWalletUiConfig, WalletUi } from '@wallet-ui/react'
import { clusterApiUrl } from '@solana/web3.js'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'

import '@solana/wallet-adapter-react-ui/styles.css'
import { Adapter } from '@solana/wallet-adapter-base'

export const WalletButton = dynamic(async () => (await import('@wallet-ui/react')).WalletUiDropdown, {
  ssr: false,
})
export const ClusterButton = dynamic(async () => (await import('@wallet-ui/react')).WalletUiClusterDropdown, {
  ssr: false,
})

const config = createWalletUiConfig({
  clusters: [createSolanaDevnet(), createSolanaLocalnet()],
})

export function SolanaProvider({ children }: { children: ReactNode }) {
  const network = clusterApiUrl('devnet')
  const wallets: Adapter[] = []

  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletUi config={config}>{children}</WalletUi>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )

  // return (
  //   <ConnectionProvider endpoint={network}>
  //     <WalletProvider wallets={wallets} autoConnect>
  //       <WalletModalProvider>{children}</WalletModalProvider>
  //     </WalletProvider>
  //   </ConnectionProvider>
  // )

  // return <WalletUi config={config}>{children}</WalletUi>
}
