import React, { createContext } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import Main from './pages/Main'
import Products from './pages/Products'
import Dashboard from './pages/Dashboard'
import Header from './components/Header'
import { useEffect } from 'react'
import axios from "axios"
import Product from './pages/Product'
import { useState } from 'react'
import Footer from './components/Footer'
import Register from './pages/Register'
import Login from './pages/Login'
import MainLayout from './pages/MainLayout'
import BlankLayout from './pages/BlankLayout'
import Discounts from "./pages/Discounts.jsx";
import Lenis from "lenis"
import { Toaster } from 'react-hot-toast'

export const UserContext = createContext();


const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
          try{
            const response = await axios({
              method: "get",
              url: `${import.meta.env.VITE_BACKEND_URL}/api/auth/check`,
              headers: {
                "authorization": token
              }
            })

            if(response.data){
              setUser(response.data.data)
              setLoading(false)
            }
          }catch(err){
            setLoading(false)
            localStorage.removeItem("token")
            console.log(err);
          }
      }
      if(localStorage.getItem("token")){
        fetchData()
      }else{
        setLoading(false)
      }
  }, [token])

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            smoothWheel: true,
        });

        window.lenis = lenis;

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => lenis.destroy();
    }, []);

  if(loading){
    return (
      <div className='flex items-center justify-center h-screen'>
        در حال بارگذاری...
      </div>
    )
  }

  return (
    <UserContext.Provider value={{user, token, setToken }}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: "var(--color-bg-secondary)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            borderRadius: "18px",
            padding: "16px",
            boxShadow: "0 12px 40px var(--color-shadow)",
            fontSize: "15px",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
        <BrowserRouter>
          <Routes>
              <Route element={<MainLayout/>}>
                  <Route path="/" element={<Main />} />
                  <Route path="/Products" element={<Products />} />
                  <Route path="/Product/:id" element={<Product />} />
                  <Route path="/Discounts" element={<Discounts />} />
              </Route>
              <Route element={<BlankLayout/>}>
                  <Route path="/Login" element={<Login />} />
                  <Route path="/Register" element={<Register />} />
                  <Route path="/Dashboard" element={<Dashboard />} />
              </Route>
          </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  )
}

export default App;