import { WalletButton } from '../solana/solana-provider'
import { BlogsWeb3Create, BlogsWeb3Program, BlogsWeb3ProgramExplorerLink } from './blogs_web3-ui'
import { AppHero } from '../app-hero'
import { useWalletUi } from '@wallet-ui/react'

export default function BlogsWeb3Feature() {
  const { account } = useWalletUi()

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="hero py-[64px]">
          <div className="hero-content text-center">
            <WalletButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AppHero title="BlogsWeb3" subtitle={'Run the program by clicking the "Run program" button.'}>
        <p className="mb-6">
          <BlogsWeb3ProgramExplorerLink />
        </p>
        <BlogsWeb3Create />
      </AppHero>
      <BlogsWeb3Program />
    </div>
  )
}
