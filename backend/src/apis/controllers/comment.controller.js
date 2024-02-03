import Comment from '../models/comment.model.js'
import catchAsync from '../../utils/catchAsync.js'
import ApiError from '../../utils/ApiError.js'
import statusCode from '../../config/status.js'

export const createComment = catchAsync(async (req, res, next) => {
  const { content, postId, userId } = req.body

  if (userId !== req.user.id) {
    throw new ApiError(
      statusCode.FORBIDDEN,
      'You are not allow to create this comment'
    )
  }

  const comment = await Comment.create({ content, postId, userId })

  res
    .status(statusCode.OK)
    .json({ message: 'Create comment successfully', comment })
})

export const getPostComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find({ postId: req.params.postId }).sort({
    createdAt: -1
  })

  res
    .status(statusCode.OK)
    .json({ message: 'Get comments successfully', comments })
})

export const likeComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId)
  let isLike

  if (!comment) {
    throw new ApiError(statusCode.BAD_REQUEST, 'Comment not found')
  }

  const userIndex = comment.likes.indexOf(req.user.id)

  if (userIndex === -1) {
    comment.likes.push(req.user.id)
    comment.numberOfLikes += 1
    isLike = 'Like'
  } else {
    comment.likes.splice(userIndex, 1)
    comment.numberOfLikes -= 1
    isLike = 'Unlike'
  }

  await comment.save()

  res
    .status(statusCode.OK)
    .json({ message: `${isLike} comment successfully`, comment })
})

export const editComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId)

  if (!comment) {
    throw new ApiError(statusCode.BAD_REQUEST, 'Comment not found')
  }

  if (!req.user.isAdmin && comment.userId !== req.user.id) {
    throw new ApiError(
      statusCode.FORBIDDEN,
      'You are not allow to edit this comment'
    )
  }

  if (req.body.content) {
    comment.content = req.body.content
  }

  await comment.save()

  res
    .status(statusCode.OK)
    .json({ message: 'Edit comment successfully', comment })
})

export const deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId)

  if (!comment) {
    throw new ApiError(statusCode.BAD_REQUEST, 'Comment not found')
  }

  if (!req.user.isAdmin && comment.userId !== req.user.id) {
    throw new ApiError(
      statusCode.FORBIDDEN,
      'You are not allow to delete this comment'
    )
  }

  await Comment.findByIdAndDelete(req.params.commentId)

  res.status(statusCode.OK).json({ message: 'Delete comment successfully' })
})

export const getComments = catchAsync(async (req, res, next) => {
  if (!req.user.isAdmin) {
    throw new ApiError(
      statusCode.FORBIDDEN,
      'You are not allow to get all comments'
    )
  }

  const startIndex = parseInt(req.query.startIndex) || 0
  const limit = parseInt(req.query.limit) || 9
  const sortDirection = req.query.order === 'asc' ? 1 : -1

  const comments = await Comment.find()
    .sort({ updatedAt: sortDirection })
    .skip(startIndex)
    .limit(limit)

  const count = await Comment.countDocuments()

  const now = new Date()
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  )

  const lastMonthComments = await Comment.countDocuments({
    createdAt: { $gte: oneMonthAgo }
  })

  res.status(statusCode.OK).json({
    message: 'Get posts successfully',
    comments,
    totalComments: count,
    lastMonthComments
  })
})
