import { useEffect, useState } from "react"
import { useSelector } from 'react-redux'

import PostCard from "./PostCard"

import env from "../config/env"

function DashBookmark() {
  const { currentUser } = useSelector(state => state.user)
  const [posts, setPosts] = useState([])
  const [showMore, setShowMore] = useState(false)

  const handleShowMore = async () => {
    const startIndex = posts.length

    try {
      const res = await fetch(`${env.API_ROOT}/api/v1/posts/getPosts?bookmark=${currentUser._id}&startIndex=${startIndex}`)

      const data = await res.json()

      if (res.ok) {
        setPosts((prev) => [...prev, ...data.posts])

        if (data.posts.length < 9) {
          setShowMore(false)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${env.API_ROOT}/api/v1/posts/getPosts?bookmark=${currentUser._id}`)

        const data = await res.json()
        setPosts(data.posts)

        if (data.posts.length <= 9) {
          setShowMore(false)
        } else {
          setShowMore(true)
        }
      } catch (error) {
        console.log(error)
      }
    }

    fetchPosts()
  }, [])

  return (
    <div className='p-7 flex flex-wrap gap-4'>
      {
        posts.map((post) => {
          return <PostCard key={post._id} post={post} />
        })
      }
      {
        showMore &&
        <button onClick={handleShowMore} className='text-teal-500 text-lg hover:underline p-7'>Show More</button>
      }
    </div>
  )
}

export default DashBookmark