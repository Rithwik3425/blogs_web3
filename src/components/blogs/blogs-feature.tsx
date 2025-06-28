import { useWalletUi } from '@wallet-ui/react'
import { AppHero } from '../app-hero'
import { WalletButton } from '../solana/solana-provider'
import { BlogsProgram, BlogsProgramExplorerLink } from './blogs-ui'
import CreateBlogForm from './create-blog'

export default function BlogsFeature() {
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
      <AppHero title="Blogs" subtitle={'Run the program by clicking the "Run program" button.'}>
        <p className="mb-6">
          <BlogsProgramExplorerLink />
        </p>
        <CreateBlogForm />
      </AppHero>
      <BlogsProgram />
    </div>
  )
}
