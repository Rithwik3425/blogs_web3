'use client'
import { useWalletTransactionSignAndSend } from '@/components/solana/use-wallet-transaction-sign-and-send'
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer'
import { toastTx } from '@/components/toast-tx'
import { getBlogsProgramId, getGreetInstruction } from '@project/anchor'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useWalletUi } from '@wallet-ui/react'
import { useMemo } from 'react'
import { toast } from 'sonner'
import type { Address } from '@solana/addresses'
import type { IInstruction, IAccountMeta } from 'gill'
import { sha256 } from 'js-sha256'

export function useBlogsProgramId() {
  const { cluster } = useWalletUi()
  return useMemo(() => getBlogsProgramId(cluster.id), [cluster])
}

export function useGetProgramAccountQuery() {
  const { client, cluster } = useWalletUi()
  return useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => client.rpc.getAccountInfo(getBlogsProgramId(cluster.id)).send(),
  })
}

export function useGreetMutation() {
  const programAddress = useBlogsProgramId()
  const txSigner = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()

  return useMutation({
    mutationFn: async () => {
      return await signAndSend(getGreetInstruction({ programAddress }), txSigner)
    },
    onSuccess: (signature) => {
      toastTx(signature)
    },
    onError: () => toast.error('Failed to run program'),
  })
}
function createInitializeBlogInstructionData(
  blogID: string,
  title: string,
  ipfsHash: string,
  sha256Hash: string,
): Buffer {
  // Use the exact discriminator from your IDL
  const discriminator = Buffer.from([195, 223, 187, 134, 244, 232, 54, 32])

  console.log(
    'Using discriminator:',
    Array.from(discriminator)
      .map((b) => b.toString(16))
      .join(' '),
  )

  // Anchor string encoding: 4-byte length prefix + UTF-8 bytes (no null terminator)
  const blogIDBuffer = Buffer.from(blogID, 'utf8')
  const titleBuffer = Buffer.from(title, 'utf8')
  const ipfsHashBuffer = Buffer.from(ipfsHash, 'utf8')
  const sha256HashBuffer = Buffer.from(sha256Hash, 'utf8')

  const totalLength =
    8 + // discriminator
    4 +
    blogIDBuffer.length + // blogID with length prefix
    4 +
    titleBuffer.length + // title with length prefix
    4 +
    ipfsHashBuffer.length + // ipfsHash with length prefix
    4 +
    sha256HashBuffer.length // sha256Hash with length prefix

  const data = Buffer.alloc(totalLength)
  let offset = 0

  // Write discriminator
  discriminator.copy(data, offset)
  offset += 8

  // Write blogID (4-byte little-endian length + string bytes)
  data.writeUInt32LE(blogIDBuffer.length, offset)
  offset += 4
  blogIDBuffer.copy(data, offset)
  offset += blogIDBuffer.length

  // Write title
  data.writeUInt32LE(titleBuffer.length, offset)
  offset += 4
  titleBuffer.copy(data, offset)
  offset += titleBuffer.length

  // Write ipfsHash
  data.writeUInt32LE(ipfsHashBuffer.length, offset)
  offset += 4
  ipfsHashBuffer.copy(data, offset)
  offset += ipfsHashBuffer.length

  // Write sha256Hash
  data.writeUInt32LE(sha256HashBuffer.length, offset)
  offset += 4
  sha256HashBuffer.copy(data, offset)

  console.log('Instruction data length:', data.length)
  console.log('Instruction data (hex):', data.toString('hex'))

  return data
}

export function useInitializeBlogs() {
  const programId = useBlogsProgramId()
  const { account, connected, client } = useWalletUi()
  const txSigner = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()

  return useMutation({
    mutationFn: async ({
      blogID,
      title,
      ipfsHash,
      sha256Hash,
    }: {
      blogID: string
      title: string
      ipfsHash: string
      sha256Hash: string
    }) => {
      if (!connected || !account) {
        throw new Error('Wallet not connected')
      }

      const ownerPubkey = new PublicKey(account.address)
      const [blogPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(blogID, 'utf8'), ownerPubkey.toBuffer()],
        new PublicKey(programId),
      )

      console.log('Expected PDA seeds:', [blogID, account.address])
      console.log('Derived PDA:', blogPDA.toBase58())
      console.log('Program ID used for PDA:', programId)
      console.log('Blog PDA:', blogPDA.toBase58())
      console.log('Program ID:', programId)
      console.log('Owner:', account.address)

      // Check if the blog PDA already exists to avoid conflicts
      try {
        const blogPDAInfo = await client.rpc.getAccountInfo(blogPDA.toBase58() as Address).send()
        if (blogPDAInfo !== null) {
          throw new Error('Blog already exists')
        }
      } catch (error) {
        // Account doesn't exist, which is what we want for initialization
      }

      const instruction: IInstruction = {
        programAddress: programId,
        accounts: [
          {
            address: blogPDA.toBase58() as Address,
            role: 'writable' as any, // PDA account being created
          },
          {
            address: account.address as Address,
            role: 'writable-signer' as any, // Payer account (needs to be writable for rent payment)
          },
          {
            address: SystemProgram.programId.toBase58() as Address,
            role: 'readonly' as any, // System program stays readonly
          },
        ],
        data: createInitializeBlogInstructionData(blogID, title, ipfsHash, sha256Hash),
      }

      return await signAndSend(instruction, txSigner)
    },
    onSuccess: (signature) => {
      console.log('Blog initialized successfully:', signature)
      // toastTx(signature)toast.success('Blog initialized successfully')
    },
    onError: (error) => {
      console.error('Failed to initialize blog:', error)
      toast.error('Failed to initialize blog')
    },
  })
}

// Hook to check if a blog exists
export function useBlogExistsQuery(blogID: string) {
  const { account, connected } = useWalletUi()
  const programId = useBlogsProgramId()
  const { client } = useWalletUi()

  return useQuery({
    queryKey: ['blog-exists', blogID, account?.address],
    queryFn: async () => {
      if (!connected || !account) return false

      const [blogPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(blogID, 'utf8'), new PublicKey(account.address).toBuffer()],
        new PublicKey(programId),
      )

      try {
        // Convert PublicKey to Address type for the RPC call
        const accountInfo = await client.rpc.getAccountInfo(blogPDA.toBase58() as Address).send()
        return accountInfo !== null
      } catch (error) {
        return false
      }
    },
    enabled: connected && !!account && !!blogID,
  })
}
