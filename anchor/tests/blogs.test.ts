import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { Blogs } from '../target/types/blogs'
import { createHash } from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import * as assert from 'assert'

describe('blogs', () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.Blogs as Program<Blogs>
  const blogsAddress = program.programId

  it('should initialize a blog', async () => {
    const blogTitle = 'My First Blog'
    const ipfsHash = 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'
    const blogDescription = 'This is my first blog about Web3 development.'
    const sha256Hash = createHash('sha256').update(blogDescription).digest('hex')

    console.log('Creating blog with:')
    console.log('Title:', blogTitle)
    console.log('IPFS Hash:', ipfsHash)
    console.log('SHA256 Hash:', sha256Hash)
    console.log('Owner:', provider.wallet.publicKey.toBase58())

    const blogId = uuidv4().replace(/-/g, '')

    const [blogPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(blogId), provider.wallet.publicKey.toBuffer()],
      blogsAddress,
    )

    await program.methods
      .initializeBlog(blogId, blogTitle, ipfsHash, sha256Hash)
      .accountsStrict({
        blogState: blogPDA,
        owner: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    console.log('Blog created successfully!')

    const blogAccount = await program.account.blogState.fetch(blogPDA)
    console.log('Fetched Blog Account:', blogAccount)

    assert.strictEqual(blogAccount.title, blogTitle)
    assert.strictEqual(blogAccount.ipfsHash, ipfsHash)
    assert.strictEqual(blogAccount.sha256Hash, sha256Hash)
    assert.strictEqual(blogAccount.owner.toBase58(), provider.wallet.publicKey.toBase58())

    console.log('All assertions passed! Blog created and verified successfully.')
  })

  it('should create multiple blogs with different titles', async () => {
    const blogs = [
      {
        title: 'Web3 Tutorial',
        description: 'Learn Web3 development step by step.',
        ipfsHash: 'QmTest1Hash1234567890abcdef',
      },
      {
        title: 'Solana Guide',
        description: 'Complete guide to Solana development.',
        ipfsHash: 'QmTest2Hash1234567890abcdef',
      },
    ]

    for (const blog of blogs) {
      const sha256Hash = createHash('sha256').update(blog.description).digest('hex')
      const blogId = uuidv4().replace(/-/g, '')

      const [blogPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(blogId), provider.wallet.publicKey.toBuffer()],
        blogsAddress,
      )

      await program.methods
        .initializeBlog(blogId, blog.title, blog.ipfsHash, sha256Hash)
        .accountsStrict({
          blogState: blogPDA,
          owner: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      const blogAccount = await program.account.blogState.fetch(blogPDA)
      assert.strictEqual(blogAccount.title, blog.title)
      assert.strictEqual(blogAccount.ipfsHash, blog.ipfsHash)
      assert.strictEqual(blogAccount.sha256Hash, sha256Hash)
      assert.strictEqual(blogAccount.owner.toBase58(), provider.wallet.publicKey.toBase58())

      console.log(`Blog "${blog.title}" created successfully!`)
    }
  })

  it('should update an existing blog', async () => {
    const blogId = uuidv4().replace(/-/g, '')

    const [blogPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(blogId), provider.wallet.publicKey.toBuffer()],
      blogsAddress,
    )

    const initialTitle = 'Before Update'
    const initialIpfsHash = 'Qm123'
    const initialSha = 'abc123'

    await program.methods
      .initializeBlog(blogId, initialTitle, initialIpfsHash, initialSha)
      .accountsStrict({
        blogState: blogPDA,
        owner: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    const newTitle = 'Updated Blog Title'
    const newIpfs = 'QmUpdated'
    const newSha = 'updatedsha256'

    await program.methods
      .updateBlog(blogId, newTitle, newIpfs, newSha)
      .accountsStrict({
        blogState: blogPDA,
        owner: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    const blogAccount = await program.account.blogState.fetch(blogPDA)

    console.log('Updated Blog Account:', blogAccount)

    assert.strictEqual(blogAccount.title, newTitle)
    assert.strictEqual(blogAccount.ipfsHash, newIpfs)
    assert.strictEqual(blogAccount.sha256Hash, newSha)
    assert.strictEqual(blogAccount.owner.toBase58(), provider.wallet.publicKey.toBase58())
  })

  it('should delete a blog', async () => {
    const blogId = uuidv4().replace(/-/g, '')

    const [blogPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(blogId), provider.wallet.publicKey.toBuffer()],
      blogsAddress,
    )

    const initialTitle = 'Blog to Delete'
    const initialIpfsHash = 'QmDelete'
    const initialSha = 'deletehash'

    await program.methods
      .initializeBlog(blogId, initialTitle, initialIpfsHash, initialSha)
      .accountsStrict({
        blogState: blogPDA,
        owner: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    await program.methods
      .deleteBlog(blogId)
      .accountsStrict({
        blogState: blogPDA,
        owner: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    try {
      await program.account.blogState.fetch(blogPDA)
      throw new Error('Blog should have been deleted but was found')
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error when fetching deleted blog:', error.message)
        const errorMessage = error.message.toLowerCase()
        const isDeleted =
          errorMessage.includes('could not find') ||
          errorMessage.includes('account does not exist') ||
          errorMessage.includes('invalid account data') ||
          errorMessage.includes('account not found')

        assert(isDeleted, `Blog should be deleted. Got error: ${error.message}`)
      } else {
        console.log('Error when fetching deleted blog:', error)
        assert.fail(`Blog should be deleted. Got non-Error: ${String(error)}`)
      }
    }

    console.log('Blog deleted successfully!')
  })
})
