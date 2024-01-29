import Post from '../models/post.model.js'
import catchAsync from '../../utils/catchAsync.js'
import ApiError from '../../utils/ApiError.js'
import statusCode from '../../config/status.js'
import slugify from '../../utils/slugify.js'

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

  const slug = slugify(req.body.title)

  const post = await Post.create({ ...req.body, slug, userId: req.user.id })

  res.status(201).json({ message: 'Create post successfully', post })
})

export const getPosts = catchAsync(async (req, res, next) => {
  const startIndex = parseInt(req.query.startIndex) || 0
  const limit = parseInt(req.query.limit) || 9
  const sortDirection = req.query.order === 'asc' ? 1 : -1

  const posts = await Post.find({
    ...(req.query.userId && { userId: req.query.userId }),
    ...(req.query.category && { category: req.query.category }),
    ...(req.query.slug && { slug: req.query.slug }),
    ...(req.query.postId && { _id: req.query.postId }),
    ...(req.query.searchTerm && {
      $or: [
        { title: { $regex: req.query.searchTerm, $options: 'i' } },
        { content: { $regex: req.query.searchTerm, $options: 'i' } }
      ]
    })
  })
    .sort({ updatedAt: sortDirection })
    .skip(startIndex)
    .limit(limit)

  const count = await Post.countDocuments()

  const now = new Date()
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  )

  const lastMonthPosts = await Post.countDocuments({
    createdAt: { $gte: oneMonthAgo }
  })

  res.status(statusCode.OK).json({
    message: 'Get posts successfully',
    posts,
    totalPosts: count,
    lastMonthPosts
  })
})
