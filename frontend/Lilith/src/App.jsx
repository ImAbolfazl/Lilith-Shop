import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import Main from './pages/Main'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Header from './components/Header'
import { useEffect } from 'react'
import axios from "axios"

const App = () => {
  return (
  <BrowserRouter>
      <Header/>
      <Routes>
        <Route path='/' element={<Main/>}/>
        <Route path='/product' element={<Product/>}/>
        <Route path='/cart' element={<Cart/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App