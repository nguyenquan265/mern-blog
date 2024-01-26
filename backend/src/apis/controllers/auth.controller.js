import User from '../models/user.model.js'
import catchAsync from '../../utils/catchAsync.js'
import ApiError from '../../utils/ApiError.js'
import statusCode from '../../config/status.js'
import env from '../../config/env.js'

import jwt from 'jsonwebtoken'

export const signup = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    throw new ApiError(statusCode.BAD_REQUEST, 'All fields are required')
  }

  await User.create({ username, email, password })

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

  const token = jwt.sign({ id: user._id }, env.jwt.jwt_secret)
  const { password: pass, ...rest } = user._doc

  res.cookie('access_token', token, {
    httpOnly: true
  })

  res.status(statusCode.OK).json({ message: 'Signin successfully', user: rest })
})

export const google = catchAsync(async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body

  const user = await User.findOne({ email })

  if (user) {
    const token = jwt.sign({ id: user._id }, env.jwt.jwt_secret)

    res.cookie('access_token', token, {
      httpOnly: true
    })

    res.status(statusCode.OK).json({ message: 'Signin successfully', user })
  } else {
    const generatedPassword = Math.random().toString(36).slice(-8)

    const user = await User.create({
      username:
        name.toLowerCase().split(' ').join('') +
        Math.random().toString(9).slice(-4),
      email,
      password: generatedPassword,
      profilePicture: googlePhotoUrl
    })

    const token = jwt.sign({ id: user._id }, env.jwt.jwt_secret)
    const { password: pass, ...rest } = user._doc

    res.cookie('access_token', token, {
      httpOnly: true
    })

    res
      .status(statusCode.OK)
      .json({ message: 'Signin successfully', user: rest })
  }
})
