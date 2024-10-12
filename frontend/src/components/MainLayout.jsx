import React from 'react'
import Navbar from './pages/fixbar/Navbar'
import Sidebar from './pages/fixbar/Sidebar'
import Home from './pages/user/Home'
import { Outlet } from 'react-router-dom'


function MainLayout() {
  return (
    <section id='mainLayout'>
        <Navbar />
        <Sidebar />
        <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3' }}>
          <Outlet />
        </div>
    </section>
  )
}

export default MainLayout