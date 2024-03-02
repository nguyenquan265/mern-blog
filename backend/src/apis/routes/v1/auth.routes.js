import express from 'express'
const router = express.Router()

import {
  signup,
  signin,
  google,
  signout,
  forgotPassword,
  resetPassword
} from '../../controllers/auth.controller.js'

router.post('/signup', signup)
router.post('/signin', signin)
router.post('/google', google)
router.post('/signout', signout)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

export default router
