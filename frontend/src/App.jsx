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

export const UserContext = createContext();


const App = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark")
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  localStorage.setItem("theme", theme);

  document.documentElement.style.setProperty(
    "--color-bg-primary",
    theme === "dark" ? "#0B0818" : "#CECECE"
  );

  document.documentElement.style.setProperty(
    "--color-bg-secondary",
    theme === "dark" ? "#161124" : "#F1F1F1"
  );

  document.documentElement.style.setProperty(
    "--color-text-primary",
    theme === "dark" ? "#F7F5FA" : "#1F1A2E"
  );

  document.documentElement.style.setProperty(
    "--color-text-secondary",
    theme === "dark" ? "#B3ADBF" : "#6C6880"
  );

  document.documentElement.style.setProperty(
    "--color-accent-primary",
    theme === "dark" ? "#FF5BAA" : "#E93F95"
  );

  document.documentElement.style.setProperty(
    "--color-accent-secondary",
    theme === "dark" ? "#B86BFF" : "#9A5CF8"
  );
}, [theme]);

  useEffect(() => {
    if(token){
      localStorage.setItem("token", token)
    }else{
      localStorage.removeItem("token")
    }
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
        <BrowserRouter>
          <Routes>
              <Route element={<MainLayout theme={theme} setTheme={setTheme} />}>
                  <Route path="/" element={<Main />} />
                  <Route path="/Products" element={<Products />} />
                  <Route path="/Product/:id" element={<Product />} />
                  <Route path="/Discounts" element={<Discounts />} />
              </Route>
              <Route element={<BlankLayout theme={theme} setTheme={setTheme}  />}>
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