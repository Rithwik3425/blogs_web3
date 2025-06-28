import { useWalletUi } from '@wallet-ui/react'
import { sha256 } from 'js-sha256'
import { useState } from 'react'
import { toast } from 'sonner'
import { useWalletUiSigner } from '../solana/use-wallet-ui-signer'
import { useBlogExistsQuery, useInitializeBlogs } from './blogs-data-access'
import { v4 as uuidv4 } from 'uuid'

export default function CreateBlogForm() {
  const [title, setTitle] = useState('test')
  const [ipfsHash, setIpfsHash] = useState('QmQPeNsJPyVWPFvHv7MYgPYALuDvopvBaSEEJvLTxHYmmX')
  const [description, setDescription] = useState('test description')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const { wallet } = useWalletUi()
  const signer = useWalletUiSigner()

  const initializeBlogMutation = useInitializeBlogs()
  const { data: blogExists } = useBlogExistsQuery('229muqFhfrLZVP8q5CrSe7x1LyHLj54wopYdpX9Mzbuw')
  const isWalletConnected = wallet?.accounts[0]?.address === signer.address ? true : false

  // Validation function
  const validateForm = () => {
    if (!title.trim()) {
      toast.error('Please enter a blog title.')
      return false
    }
    if (title.length > 32) {
      toast.error('Title must be 32 characters or less.')
      return false
    }
    if (!ipfsHash.trim()) {
      toast.error('Please enter an IPFS hash.')
      return false
    }
    if (ipfsHash.length > 64) {
      toast.error('IPFS hash must be 64 characters or less.')
      return false
    }
    if (!description.trim()) {
      toast.error('Please enter a blog description.')
      return false
    }
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setIsPending(true)
    try {
      // Generate SHA-256 hash for the blog content
      const sha256Hash = sha256(description)
      const blogId = uuidv4().replace(/-/g, '')

      let signature: string | undefined
      if (!blogExists) {
        signature = await initializeBlogMutation.mutateAsync({
          blogID: blogId,
          title,
          ipfsHash,
          sha256Hash,
        })
      }

      console.log('Blog created with signature:', signature)
      toast.success(`Blog created successfully! Signature: ${signature}`)

      // Reset form fields
      setTitle('')
      setIpfsHash('')
      setDescription('')
    } catch (error) {
      console.error('Error creating blog:', error)
      toast.error('Failed to create blog. Please try again.')
    } finally {
      setIsSubmitting(false)
      setIsPending(false)
    }
  }

  const isLoading = isPending || isSubmitting

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Create New Blog</h2>

      {!isWalletConnected && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          Please connect your wallet to create a blog.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col justify-center items-center">
        <div className="w-full">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Blog Title (max 32 characters)"
            maxLength={32}
            className="input input-bordered w-full h-12 p-4 rounded-2xl"
            disabled={isLoading}
          />
          <div className="text-xs text-gray-500 mt-1">{title.length}/32 characters</div>
        </div>

        <div className="w-full">
          <input
            value={ipfsHash}
            onChange={(e) => setIpfsHash(e.target.value)}
            placeholder="IPFS Hash (max 64 characters)"
            maxLength={64}
            className="input input-bordered w-full h-12 p-4 rounded-2xl"
            disabled={isLoading}
          />
          <div className="text-xs text-gray-500 mt-1">{ipfsHash.length}/64 characters</div>
        </div>

        <div className="w-full">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Blog Description"
            className="textarea textarea-bordered w-full h-24 p-4 rounded-2xl"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={!isWalletConnected || initializeBlogMutation.isPending}
          className="btn btn-primary bg-white text-black p-2 rounded-2xl hover:bg-gray-300 active:bg-black active:border-white border active:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {initializeBlogMutation.isPending ? 'Creating...' : 'Create Blog'}
        </button>
      </form>
    </div>
  )
}
