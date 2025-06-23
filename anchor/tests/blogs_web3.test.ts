import * as anchor from '@coral-xyz/anchor'
import { BlogsWeb3 } from '../target/types/blogs_web3'
import { Program } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { BankrunProvider } from 'anchor-bankrun'
import { startAnchor } from 'solana-bankrun'
import { expect } from 'chai'
import { createHash } from 'crypto'
import { v4 as uuidv4 } from 'uuid'

const IDL = require('../target/idl/blogs_web3.json') as BlogsWeb3

const blogsAddress = new PublicKey('JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H')

describe('blogs_web3', () => {
  let context: any
  let provider: BankrunProvider
  let blogsProgram: Program<BlogsWeb3>

  beforeAll(async () => {
    context = await startAnchor('', [{ name: 'blogs_web3', programId: blogsAddress }], [])
    provider = new BankrunProvider(context)
    blogsProgram = new Program<BlogsWeb3>(IDL, provider)
  })

  it('should initialize a blog', async () => {
    // Blog data - keeping within your max_len constraints
    const blogTitle = 'My First Blog' // max_len(32) in Rust
    const ipfsHash = 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco' // max_len(64) in Rust
    const blogDescription = 'This is my first blog about Web3 development.'
    const sha256Hash = createHash('sha256').update(blogDescription).digest('hex') // max_len(64) in Rust

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

    await blogsProgram.methods
      .initializeBlog(blogId, blogTitle, ipfsHash, sha256Hash)
      .accounts({
        blogState: blogPDA,
        owner: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    console.log('Blog created successfully!')

    // Fetch and verify the created blog
    const blogAccount = await blogsProgram.account.blogState.fetch(blogPDA)
    console.log('Fetched Blog Account:', blogAccount)

    // Verify the data matches what we sent
    expect(blogAccount.title).to.equal(blogTitle)
    expect(blogAccount.ipfsHash).to.equal(ipfsHash)
    expect(blogAccount.sha256Hash).to.equal(sha256Hash)
    expect(blogAccount.owner.toBase58()).to.equal(provider.wallet.publicKey.toBase58())

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

      await blogsProgram.methods
        .initializeBlog(blogId, blog.title, blog.ipfsHash, sha256Hash)
        .accounts({
          blogState: blogPDA,
          owner: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      const blogAccount = await blogsProgram.account.blogState.fetch(blogPDA)
      expect(blogAccount.title).to.equal(blog.title)
      expect(blogAccount.ipfsHash).to.equal(blog.ipfsHash)
      expect(blogAccount.sha256Hash).to.equal(sha256Hash)
      expect(blogAccount.owner.toBase58()).to.equal(provider.wallet.publicKey.toBase58())

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

    await blogsProgram.methods
      .initializeBlog(blogId, initialTitle, initialIpfsHash, initialSha)
      .accounts({
        blogState: blogPDA,
        owner: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([])
      .rpc()

    // 🚀 Now call the update function
    const newTitle = 'Updated Blog Title'
    const newIpfs = 'QmUpdated'
    const newSha = 'updatedsha256'

    await blogsProgram.methods
      .updateBlog(blogId, newTitle, newIpfs, newSha)
      .accounts({
        blogState: blogPDA,
        owner: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([])
      .rpc()

    // 🧪 Fetch the account and verify the update
    const blogAccount = await blogsProgram.account.blogState.fetch(blogPDA)

    console.log('Updated Blog Account:', blogAccount)

    expect(blogAccount.title).to.equal(newTitle)
    expect(blogAccount.ipfsHash).to.equal(newIpfs)
    expect(blogAccount.sha256Hash).to.equal(newSha)
    expect(blogAccount.owner.toBase58()).to.equal(provider.wallet.publicKey.toBase58())
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

    await blogsProgram.methods
      .initializeBlog(blogId, initialTitle, initialIpfsHash, initialSha)
      .accounts({
        blogState: blogPDA,
        owner: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([])
      .rpc()

    // Now call the delete function
    await blogsProgram.methods
      .deleteBlog(blogId)
      .accounts({
        blogState: blogPDA,
        owner: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([])
      .rpc()

    // Verify the blog is deleted
    try {
      await blogsProgram.account.blogState.fetch(blogPDA)
      throw new Error('Blog should have been deleted but was found')
    } catch (error) {
      expect(error.message).to.include('Could not find')
    }

    console.log('Blog deleted successfully!')
  })
})
