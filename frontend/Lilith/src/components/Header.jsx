import React from 'react'
import { Link } from 'react-router' 
import logo from "../assets/logo.png"

const Header = () => {
  return (
    <div className='flex items-center justify-around'>
        <div className='flex gap-5 text-2xl'>
            <Link to="/Cart">خدمات استیم</Link>
            <Link to="/Cart">خدمات ماینکرفت</Link>
            <Link to="/Cart">خدمات کالاف دیوتی</Link>
            <Link to="/Cart">سایر خدمات</Link>
        </div>
        <Link to="/"><img src={logo} alt="Lilith" className='h-20'/></Link>
    </div>
  )
}

export default Header