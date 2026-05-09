import express from 'express'
import ImageKit from 'imagekit'
import { protect } from '../middleware/authMiddleware.js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
})

// Get ImageKit authentication parameters
router.get('/auth', protect, (req, res) => {
  try {
    const result = imagekit.getAuthenticationParameters()
    res.send(result)
  } catch (error) {
    console.error('ImageKit auth error:', error)
    res.status(500).json({ message: 'Failed to get upload auth' })
  }
})

export default router
