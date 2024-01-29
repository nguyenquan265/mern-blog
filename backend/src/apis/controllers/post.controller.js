import Post from '../models/post.model.js'
import catchAsync from '../../utils/catchAsync.js'
import ApiError from '../../utils/ApiError.js'
import statusCode from '../../config/status.js'

export const create = catchAsync(async (req, res, next) => {
  if (!req.user.isAdmin) {
    throw new ApiError(
      statusCode.FORBIDDEN,
      'You are not allow to create a post'
    )
  }

  if (!req.body.title || !req.body.content) {
    throw new ApiError(statusCode.BAD_REQUEST, 'All fields are required')
  }

  const slug = req.body.title
    .toLowerCase()
    .split(' ')
    .join('-')
    .replace(/[^a-zA-Z0-9-]/g, '')

  const post = await Post.create({ ...req.body, slug, userId: req.user.id })

  res.status(201).json({ message: 'Create post successfully', post })
})
