import { useEffect, useState } from "react"
import moment from 'moment'
import { FaThumbsUp } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { Button, Textarea } from "flowbite-react"

function Comment({ comment, onLike, onEdit, onDelete }) {
  const { currentUser } = useSelector(state => state.user)
  const [user, setUser] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)

  const handleEdit = () => {
    setIsEditing(true)
    setEditedContent(comment.content)
  }

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/comments/editComment/${comment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: editedContent })
      })

      if (res.ok) {
        setIsEditing(false)
        onEdit(comment, editedContent)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/users/getUser/${comment.userId}`)

        const data = await res.json()

        if (res.ok) {
          setUser(data.user)
        }
      } catch (error) {
        console.log(error)
      }
    }

    getUser()
  }, [comment])

  return (
    <div className='flex p-4 border-b dark:border-gray-600 text-sm'>
      <div className='flex-shrink-0 mr-3'>
        <img
          className='w-10 h-10 rounded-full bg-gray-200'
          src={user ? user.profilePicture : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
          alt={user.username}
        />
      </div>
      <div className='flex-1'>
        <div className='flex items-center mb-1'>
          <span className='font-bold mr-1 text-xs truncate'>{user ? `@${user.username}` : 'anonymous user'}</span>
          <span className='text-gray-500 text-xs'>
            {moment(comment.createdAt).fromNow()}
          </span>
        </div>
        {
          isEditing ?
            <>
              <Textarea
                className='mb-2'
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
              <div className='flex justify-end gap-2 text-xs'>
                <Button
                  type='button'
                  size='sm'
                  gradientDuoTone='purpleToBlue'
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button
                  type='button'
                  size='sm'
                  gradientDuoTone='purpleToBlue'
                  outline
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
            :
            <>
              <p className='text-gray-500 pb-2'>{comment.content}</p>
              <div className='flex items-center pt-2 text-xs border-t dark:border-gray-700 max-w-fit gap-2'>
                <button
                  type='button'
                  className={`text-gray-400 hover:text-blue-500 ${currentUser && comment.likes.includes(currentUser._id) && '!text-blue-500'}`}
                  onClick={() => onLike(comment._id)}
                >
                  <FaThumbsUp className='text-sm' />
                </button>
                <p className='text-gray-400'>
                  {comment.numberOfLikes > 0 && comment.numberOfLikes + ' ' + (comment.numberOfLikes === 1 ? 'like' : 'likes')}
                </p>
                {
                  currentUser && (currentUser._id === comment.userId || currentUser.isAdmin) &&
                  <>
                    <button
                      type='button'
                      className='text-gray-400 hover:text-blue-500'
                      onClick={handleEdit}
                    >
                      Edit
                    </button>
                    <button
                      type='button'
                      className='text-gray-400 hover:text-blue-500'
                      onClick={() => onDelete(comment._id)}
                    >
                      Delete
                    </button>
                  </>
                }
              </div>
            </>
        }
      </div>
    </div>
  )
}

export default Comment