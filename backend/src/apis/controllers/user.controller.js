import User from '../models/user.model.js'
import catchAsync from '../../utils/catchAsync.js'
import ApiError from '../../utils/ApiError.js'
import statusCode from '../../config/status.js'

export const updateUser = catchAsync(async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    throw new ApiError(
      statusCode.FORBIDDEN,
      'You are not allowed to update this user'
    )
  }

  const user = await User.findById(req.params.userId)

  if (req.body.currentPassword && req.body.newPassword) {
    if (req.body.currentPassword === req.body.newPassword) {
      throw new ApiError(statusCode.BAD_REQUEST, 'Password must not the same')
    }

    if (!(await user.comparePassword(req.body.currentPassword))) {
      throw new ApiError(statusCode.UNAUTHORIZED, 'Incorrect current password')
    }

    if (req.body.newPassword.length < 6) {
      throw new ApiError(
        statusCode.BAD_REQUEST,
        'Password must be at least 6 characters'
      )
    }

    user.password = req.body.newPassword
  }

  if (req.body.username) {
    if (req.body.username.length < 5 || req.body.username.length > 20) {
      throw new ApiError(
        statusCode.BAD_REQUEST,
        'Username must be between 5 and 20 characters'
      )
    }

    if (req.body.username.includes(' ')) {
      throw new ApiError(
        statusCode.BAD_REQUEST,
        'Username can not contain space'
      )
    }

    if (req.body.username !== req.body.username.toLowerCase()) {
      throw new ApiError(statusCode.BAD_REQUEST, 'Username must be lowercase')
    }

    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      throw new ApiError(
        statusCode.BAD_REQUEST,
        'Username can only contain letters and numbers'
      )
    }

    user.username = req.body.username
  }

  if (req.body.email) {
    if (req.body.email !== user.email) {
      if (await User.findOne({ email: req.body.email })) {
        throw new ApiError(statusCode.BAD_REQUEST, 'Email already taken')
      }

      user.email = req.body.email
    }
  }

  if (req.body.profilePicture) {
    user.profilePicture = req.body.profilePicture
  }

  await user.save()
  const { password: pass, ...rest } = user._doc

  res
    .status(statusCode.OK)
    .json({ message: 'Update user profile successfully', user: rest })
})

export const deleteUser = catchAsync(async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    throw new ApiError(
      statusCode.FORBIDDEN,
      'You are not allowed to update this user'
    )
  }

  await User.findByIdAndDelete(req.params.userId)

  res.status(200).json({ message: 'User has been deleted' })
})

export const getUsers = catchAsync(async (req, res, next) => {
  if (!req.user.isAdmin) {
    throw new ApiError(
      statusCode.FORBIDDEN,
      'You are not allowed to get all users'
    )
  }

  const startIndex = parseInt(req.query.startIndex) || 0
  const limit = parseInt(req.query.limit) || 9
  const sortDirection = req.query.order === 'asc' ? 1 : -1

  const users = await User.find()
    .sort({ updatedAt: sortDirection })
    .skip(startIndex)
    .limit(limit)

  const usersWithoutPassword = users.map((user) => {
    const { password, ...rest } = user._doc
    return rest
  })

  const count = await User.countDocuments()

  const now = new Date()
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  )

  const lastMonthUsers = await User.countDocuments({
    createdAt: { $gte: oneMonthAgo }
  })

  res.status(statusCode.OK).json({
    message: 'Get users successfully',
    users: usersWithoutPassword,
    totalUsers: count,
    lastMonthUsers
  })
})

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId)

  if (!user) {
    throw new ApiError(statusCode.BAD_REQUEST, 'User not found')
  }

  const { password, ...rest } = user._doc

  res
    .status(statusCode.OK)
    .json({ message: 'Get user successfully', user: rest })
})
