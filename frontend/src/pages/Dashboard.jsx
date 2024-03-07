import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import DashPosts from '../components/DashPosts'
import DashProfile from '../components/DashProfile'
import DashSidebar from '../components/DashSidebar'
import DashUsers from '../components/DashUsers'
import DashComments from '../components/DashComments'
import DashBoardComponent from '../components/DashBoardComponent'
import DashBookmark from '../components/DashBookmark'

function Dashboard() {
  const location = useLocation()
  const [tab, setTab] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const tabFromUrl = urlParams.get('tab')

    if (tabFromUrl) {
      setTab(tabFromUrl)
    }
  }, [location])

  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      <div className='md:w-56'>
        <DashSidebar />
      </div>
      {tab === 'profile' && <DashProfile />}
      {tab === 'posts' && <DashPosts />}
      {tab === 'users' && <DashUsers />}
      {tab === 'comments' && <DashComments />}
      {tab === 'dash' && <DashBoardComponent />}
      {tab === 'bookmark' && <DashBookmark />}
    </div>
  )
}

export default Dashboard