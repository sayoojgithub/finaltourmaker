import Layout from "./layout/Layout"
import AuthProvider from "./context/AuthContext"
function App() {
  return (
    <AuthProvider>
    <div className="bg-gradient-to-b from-[#e8e0ff] to-[#f8f6ff] min-h-full">
    <Layout/>
      
    </div>
    </AuthProvider>
  )
}

export default App
