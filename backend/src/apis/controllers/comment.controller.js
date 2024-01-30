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
