import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import Main from './pages/Main'
import Products from './pages/Products'
import Dashboard from './pages/Dashboard'
import Header from './components/Header'
import { useEffect } from 'react'
import axios from "axios"
import Product from './pages/Product'

const App = () => {
  return (
  <BrowserRouter>
      <Header/>
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