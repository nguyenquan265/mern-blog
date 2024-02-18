import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Button, Spinner } from 'flowbite-react'
import CallToAction from '../components/CallToAction'
import CommentSection from '../components/CommentSection'
import PostCard from '../components/PostCard'
import { ref, get, runTransaction } from "firebase/database"
import { database } from '../firebase'
import { useSelector, useDispatch } from 'react-redux'
import {
  updateStart,
  updateSuccess,
  updateFailure,
} from '../redux/user/userSlice'

import { FaBookmark } from "react-icons/fa"
import { GrView } from "react-icons/gr"

function PostPage() {
  const { currentUser } = useSelector(state => state.user)
  const { postSlug } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [post, setPost] = useState(null)
  const [recentPosts, setRecentPosts] = useState(null)
  const [views, setViews] = useState(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleBookmark = async () => {
    if (!currentUser) {
      navigate('/sign-in')
      return
    }

    try {
      dispatch(updateStart())

      const res = await fetch(`http://localhost:8000/api/v1/posts/bookmarkPost/${post._id}/${currentUser._id}`, {
        method: 'PATCH',
        credentials: 'include'
      })

      const data = await res.json()

      if (!res.ok) {
        dispatch(updateFailure(data.message))
      } else {
        dispatch(updateSuccess(data))
        setPost(data.post)
      }
    } catch (error) {
      dispatch(updateFailure(error.message))
      console.log(error)
    }
  }

  const updateViews = (post) => {
    const postRef = ref(database, 'posts/' + post._id + '/views');

    runTransaction(postRef, (currentViews) => {
      if (currentViews === null) {
        return 1;
      }

      return currentViews + 1;
    });

    get(ref(database, `posts/${post._id}`)).then((snapshot) => {
      if (snapshot.exists()) {
        setViews((snapshot.val().views))
      } else {
        console.log("No data available")
      }
    }).catch((error) => {
      console.error(error)
    })
  }

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)

        const res = await fetch(`http://localhost:8000/api/v1/posts/getPosts?slug=${postSlug}`)

        const data = await res.json()

        if (!res.ok || !data.posts[0]) {
          setError(true)
          setLoading(false)
          return
        }

        setPost(data.posts[0])
        setLoading(false)
        setError(false)
        updateViews(data.posts[0])
      } catch (error) {
        setError(true)
        setLoading(false)
      }
    }

    fetchPost()
  }, [postSlug])

  useEffect(() => {
    try {
      const fetchRecentPosts = async () => {
        const res = await fetch('http://localhost:8000/api/v1/posts/getPosts?limit=3')

        const data = await res.json()

        if (res.ok) {
          setRecentPosts(data.posts)
        }
      }

      fetchRecentPosts()
    } catch (error) {
      console.log(error)
    }
  }, [])

  if (loading) return <div className='flex justify-center items-center min-h-screen'>
    <Spinner size='xl' />
  </div>

  if (error) return <div className="min-h-80 flex flex-col max-w-xl mx-auto justify-center" role="alert">
    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center'>
      <strong className="font-bold">Something wrong...</strong>
      <span className="block sm:inline"> Please try again!</span>
    </div>
  </div>

  return (
    <main className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen'>
      <h1 className='text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl'>
        {post.title}
      </h1>
      <Link to={`/search?category=${post.category}`} className='self-center mt-5'>
        <Button color='gray' pill size='xs'>
          {post.category}
        </Button>
      </Link>
      <div className='flex justify-end p-3'>
        <div className='flex items-center gap-1'>
          <GrView className='h-5 w-5 mr-1 text-gray-500' />
          <span className='text-gray-500'>{views}</span>
        </div>
        <div className='flex items-center gap-1'>
          {
            currentUser && post.bookmark.includes(currentUser._id) ?
              <FaBookmark
                className='h-5 w-5 ml-4 text-blue-500 hover:cursor-pointer hover:text-blue-600'
                onClick={handleBookmark}
              />
              :
              <FaBookmark
                className='h-5 w-5 ml-4 hover:cursor-pointer hover:text-gray-500'
                onClick={handleBookmark}
              />
          }
          <span className='text-gray-500'>{post.bookmark.length}</span>
        </div>
      </div>
      <img src={post.image} alt={post.title} className='mt-3 p-3 max-h-[600px] w-full object-cover' />
      <div className='flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs'>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        <span className='italic'>{(post.content.length / 1000).toFixed(0)} mins read</span>
      </div>
      <div className='p-3 max-w-2xl mx-auto w-full post-content' dangerouslySetInnerHTML={{ __html: post.content }}>
      </div>
      <div className='max-w-4xl mx-auto w-full'>
        <CallToAction />
      </div>
      <CommentSection postId={post._id} />
      <div className='flex flex-col justify-center items-center mb-5'>
        <h1 className='text-xl mt-5'>Recent articles</h1>
        <div className='flex flex-wrap gap-5 mt-5 justify-center'>
          {
            recentPosts &&
            recentPosts.map(post => {
              return <PostCard key={post._id} post={post} />
            })
          }
        </div>
      </div>
    </main>
  )
}

export default PostPage