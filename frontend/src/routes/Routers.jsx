import React from 'react'
import ProtectedRoute from './ProtectedRoute'
import Unauthorized from '../pages/Unauthorized'
import Home from '../pages/Home'
import Login from '../pages/Login'
import AdminLogin from '../pages/Admin/AdminLogin'
import Dashboard from '../pages/Admin/Dashboard'
import SalesProfile from '../pages/SalesExecutive/SalesProfile'
import CompanyProfile from '../pages/Company/CompanyProfile'
import PurchaserProfile from '../pages/Purchaser/PurchaserProfile'
import DigitalMarketerProfile from '../pages/DigitalMarketer/DigitalMarketerProfile'
import SalesManagerProfile from '../pages/SalesManager/SalesManagerProfile'
import MarketingManagerProfile from '../pages/MarketingManager/MarketingManagerProfile'
import CreativeStaffProfile from '../pages/CreativeStaff/CreativeStaffProfile'
import EntryStaffProfile from '../pages/Entry/EntryStaffProfile'
import FrontOfficerProfile from '../pages/FrontOfficer/FrontOfficerProfile'


import {Routes, Route} from "react-router-dom"
const Routers = () => {
  return <Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/home' element={<Home/>}/>
    <Route path='/login' element={<Login/>}/>
    <Route path='/adminLogin' element={<AdminLogin/>}/>
    {/* <Route path='/adminDashboard' element={<Dashboard/>}/>
    <Route path='/salesProfile' element={<SalesProfile/>}/> */}
    {/* Protected Admin Route */}
      <Route
        path='/adminDashboard'
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Sales Executive Route */}
      <Route
        path='/salesProfile'
        element={
          <ProtectedRoute allowedRoles={['salesExecutive']}>
            <SalesProfile />
          </ProtectedRoute>
        }
      />
       <Route
        path='/companyProfile'
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <CompanyProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path='/purchaserProfile'
        element={
          <ProtectedRoute allowedRoles={['purchaser']}>
            <PurchaserProfile/>
          </ProtectedRoute>
        }
      />
      <Route
        path='/digitalMarketerProfile'
        element={
          <ProtectedRoute allowedRoles={['digitalmarketer']}>
            <DigitalMarketerProfile/>
          </ProtectedRoute>
        }
      />
      <Route
        path='/salesManagerProfile'
        element={
          <ProtectedRoute allowedRoles={['salesmanager']}>
            <SalesManagerProfile/>
          </ProtectedRoute>
        }
      />
      <Route
        path='/marketingManagerProfile'
        element={
          <ProtectedRoute allowedRoles={['marketingmanager']}>
            <MarketingManagerProfile/>
          </ProtectedRoute>
        }
      />
      <Route
        path='/creativeStaffProfile'
        element={
          <ProtectedRoute allowedRoles={['creativestaff']}>
            <CreativeStaffProfile/>
          </ProtectedRoute>
        }
      />
      <Route
        path='/entryProfile'
        element={
          <ProtectedRoute allowedRoles={['entry']}>
            <EntryStaffProfile/>
          </ProtectedRoute>
        }
      />
      <Route
        path='/frontOfficerProfile'
        element={
          <ProtectedRoute allowedRoles={['frontofficer']}>
            <FrontOfficerProfile/>
          </ProtectedRoute>
        }
      />

      <Route path='/unauthorized' element={<Unauthorized />} />



  </Routes>
}

export default Routers