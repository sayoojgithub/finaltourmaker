// import React from 'react'
// import Header from '../components/Header/Header'
// import Footer from '../components/Footer/Footer'
// import Routers from '../routes/Routers'

// const Layout = () => {
//   return <>
//     <Header/>
//     <main>
//         <Routers/>
//     </main>
//     <Footer/>
//   </>
// }

// export default Layout
import React from "react"
import { useLocation } from "react-router-dom"
import Header from "../components/Header/Header"
import Footer from "../components/Footer/Footer"
import Routers from "../routes/Routers"

const Layout = () => {
  const location = useLocation()

  const hideLayout = location.pathname === "/pay"

  return (
    <>
      {!hideLayout && <Header />}

      <main>
        <Routers />
      </main>

      {!hideLayout && <Footer />}
    </>
  )
}

export default Layout
