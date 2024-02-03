import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import DashPosts from '../components/DashPosts'
import DashProfile from '../components/DashProfile'
import DashSideBar from '../components/DashSideBar'
import DashUsers from '../components/DashUsers'
import DashComments from '../components/DashComments'
import DashBoardComponent from '../components/DashBoardComponent'

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
        <DashSideBar />
      </div>
      {tab === 'profile' && <DashProfile />}
      {tab === 'posts' && <DashPosts />}
      {tab === 'users' && <DashUsers />}
      {tab === 'comments' && <DashComments />}
      {tab === 'dash' && <DashBoardComponent />}
    </div>
  )
}

export default Dashboard