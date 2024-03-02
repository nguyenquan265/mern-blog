import User from '../models/user.model.js'
import catchAsync from '../../utils/catchAsync.js'
import ApiError from '../../utils/ApiError.js'
import statusCode from '../../config/status.js'
import env from '../../config/env.js'
import Email from '../../utils/email.js'
import crypto from 'crypto'
import hash from '../../utils/hash.js'

import jwt from 'jsonwebtoken'

export const signup = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    throw new ApiError(statusCode.BAD_REQUEST, 'All fields are required')
  }

  await User.create({ username, email, password, registrationMethod: 'email' })

  res.status(statusCode.CREATED).json({ message: 'Signup successfully' })
})

export const signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new ApiError(statusCode.BAD_REQUEST, 'All fields are required')
  }

  const user = await User.findOne({ email })

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(statusCode.BAD_REQUEST, 'Invalid email or password')
  }

  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    env.jwt.jwt_secret
  )
  const { password: pass, ...rest } = user._doc

  res
    .status(statusCode.OK)
    .cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true
    })
    .json({ message: 'Signin successfully', user: rest })
})

export const google = catchAsync(async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body

  const user = await User.findOne({ email })

  if (user) {
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      env.jwt.jwt_secret
    )
    const { password: pass, ...rest } = user._doc

    res
      .status(statusCode.OK)
      .cookie('access_token', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true
      })
      .json({ message: 'Signin successfully', user: rest })
  } else {
    const user = await User.create({
      username:
        name.toLowerCase().split(' ').join('') +
        Math.random().toString(9).slice(-4),
      email,
      profilePicture: googlePhotoUrl,
      registrationMethod: 'oauth'
    })

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      env.jwt.jwt_secret
    )
    const { password: pass, ...rest } = user._doc

    res
      .status(statusCode.OK)
      .cookie('access_token', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true
      })
      .json({ message: 'Signin successfully', user: rest })
  }
})

export const signout = catchAsync(async (req, res, next) => {
  res.clearCookie('access_token')

  res.status(statusCode.OK).json({ message: 'Sign out successfully' })
})

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(statusCode.NOT_FOUND, 'No user found with this email')
  }

  const passwordToken = crypto.randomBytes(40).toString('hex')
  const passwordTokenExpirationDate = new Date(Date.now() + 10 * 60 * 1000)

  user.passwordToken = hash(passwordToken)
  user.passwordTokenExpirationDate = passwordTokenExpirationDate
  await user.save()

  await new Email().sendPasswordReset(
    user.username,
    email,
    passwordToken,
    req.headers.origin
  )

  res
    .status(statusCode.OK)
    .json({ message: 'Please check your email for reset password link' })
})

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token, email, password } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(statusCode.NOT_FOUND, 'No user found with this email')
  }

  const currentDate = new Date()

  if (
    user.passwordToken === hash(token) &&
    user.passwordTokenExpirationDate > currentDate
  ) {
    user.password = password
    user.passwordToken = null
    user.passwordTokenExpirationDate = null
    await user.save()
  } else {
    throw new ApiError(statusCode.BAD_REQUEST, 'Invalid or expired token')
  }

  res.status(statusCode.OK).json({ message: 'Reset password successgully. Please sign in.' })
})
