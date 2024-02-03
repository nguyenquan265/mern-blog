import { Button, Select, TextInput } from 'flowbite-react'
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PostCard from '../components/PostCard'

function Search() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'desc',
    category: 'uncategorized'
  })
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const handleChange = (e) => {
    if (e.target.id === 'seacrhTerm') {
      setSidebarData({ ...sidebarData, searchTerm: e.target.value })
    }

    if (e.target.id === 'sort') {
      const order = e.target.value || 'desc'

      setSidebarData({ ...sidebarData, sort: order })
    }

    if (e.target.id === 'category') {
      const category = e.target.value || 'uncategorized'

      setSidebarData({ ...sidebarData, category })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const urlParams = new URLSearchParams(location.search)
    urlParams.set('searchTerm', sidebarData.searchTerm)
    urlParams.set('sort', sidebarData.sort)
    urlParams.set('category', sidebarData.category)
    const searchQuery = urlParams.toString()

    navigate(`/search?${searchQuery}`)
  }

  const handleShowMore = async () => {
    const startIndex = posts.length
    const urlParams = new URLSearchParams(location.search)
    urlParams.set('startIndex', startIndex)
    const searchQuery = urlParams.toString()

    try {
      const res = await fetch(`http://localhost:8000/api/v1/posts/getPosts?${searchQuery}`)
      const data = await res.json()

      if (!res.ok) {
        setPosts([...posts, ...data.posts])

        if (data.posts.length < 9) {
          setShowMore(false)
        } else {
          setShowMore(true)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const searchTermFromUrl = urlParams.get('searchTerm')
    const sortFromUrl = urlParams.get('sort')
    const categoryFromUrl = urlParams.get('category')

    if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
      setSidebarData({
        ...sidebarData,
        searchTerm: searchTermFromUrl,
        sort: sortFromUrl,
        category: categoryFromUrl
      })
    }

    const fetchPosts = async () => {
      try {
        setLoading(true)

        const searchQuery = urlParams.toString()
        const res = await fetch(`http://localhost:8000/api/v1/posts/getPosts?${searchQuery}`)
        const data = await res.json()

        if (!res.ok) {
          setLoading(false)
          console.log(data.message);
          return
        }

        setPosts(data.posts)
        setLoading(false)

        if (data.posts.length < 9) {
          setShowMore(false)
        } else {
          setShowMore(true)
        }
      } catch (error) {
        setLoading(false)
        console.log(error)
      }
    }

    fetchPosts()
  }, [location.search])

  return (
    <div className='flex flex-col md:flex-row'>
      <div className='p-7 border-b md:border-r md:min-h-screen border-gray-500'>
        <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
          <div className='flex items-center gap-2'>
            <label className='whitespace-nowrap font-semibold'>Search Term:</label>
            <TextInput
              placeholder='Search...'
              id='searchTerm'
              type='text'
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Sort:</label>
            <Select onChange={handleChange} value={sidebarData.sort} id='sort'>
              <option value='desc'>Latest</option>
              <option value='asc'>Oldest</option>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Category:</label>
            <Select onChange={handleChange} value={sidebarData.category} id='category'>
              <option value='uncategorized'>uncategorized</option>
              <option value='reactjs'>Reactjs</option>
              <option value='nextjs'>Nextjs</option>
              <option value='javascript'>Javascript</option>
            </Select>
          </div>
          <Button type='submit' outline gradientDuoTone='purpleToPink'>Apply Filters</Button>
        </form>
      </div>
      <div className='w-full'>
        <h1 className='text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5'>Posts results</h1>
        <div className='p-7 flex flex-wrap gap-4'>
          {
            !loading && posts.length === 0 &&
            <p className='text-xl text-gray-500'>No posts found.</p>
          }
          {
            loading &&
            <p className='text-xl text-gray-500'>Loading...</p>
          }
          {
            !loading && posts && posts.map(post => {
              return <PostCard key={post._id} post={post} />
            })
          }
          {
            showMore &&
            <button onClick={handleShowMore} className='text-teal-500 text-lg hover:underline p-7'>Show More</button>
          }
        </div>
      </div>
    </div>
  )
}

export default Search