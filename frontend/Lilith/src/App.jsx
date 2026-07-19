import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import Main from './pages/Main'
import Products from './pages/Products'
import Dashboard from './pages/Dashboard'
import Header from './components/Header'
import { useEffect } from 'react'
import axios from "axios"
import Product from './pages/Product'
import { useState } from 'react'

const App = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark")

  useEffect(() => {
    localStorage.setItem("theme", theme);

    document.documentElement.style.setProperty("--color-bg-primary", theme === "dark" ? "#18161F" : "#F4F0F8");
    document.documentElement.style.setProperty("--color-bg-secondary", theme === "dark" ? "#24212C" : "#EEE7F7");
    document.documentElement.style.setProperty("--color-card-primary", theme === "dark" ? "#302C39" : "#FFFFFF");
    document.documentElement.style.setProperty("--color-text-primary", theme === "dark" ? "#F7F5FA" : "#272332");
    document.documentElement.style.setProperty("--color-text-secondary", theme === "dark" ? "#B3ADBF" : "#6D667C");
    document.documentElement.style.setProperty("--color-accent-primary", theme === "dark" ? "#FF5BAA" : "#E93F95");
    document.documentElement.style.setProperty("--color-accent-secondary", theme === "dark" ? "#B86BFF" : "#9A5CF8");
  }, [theme]);

  return (
  <BrowserRouter>
      <Header theme={theme} setTheme={setTheme}/>
      <Routes>
        <Route path='/' element={<Main/>}/>
        <Route path='/Products' element={<Products/>}/>
        <Route path='Product' element={<Product/>}/>
        <Route path='/Dashboard' element={<Dashboard/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App