import React from 'react'
import { Link } from 'react-router' 
import logo from "../assets/logo.png"
import { IoMdClose } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState } from 'react';

const Header = () => {
  const [sideMenu, setSideMenu] = useState(false)
  const pathsMap = [
    {name: "وورلد اف وارکرفت", path: "/Products?c=wow" },
    {name: "دیسکورد", path: "/Products?c=discord" },
    {name: "تلگرام", path: "/Products?c=telegram" },
    {name: "کیک", path: "/Products?c=kick" },
    {name: "اپیک گیمز", path: "/Products?c=epicgames" },
    {name: "توییج", path: "/Products?c=twitch" },
    {name: "اسپاتیفای", path: "/Products?c=spotify" },
    {name: "پلی استیشین", path: "/Products?c=playstation" },
    {name: "خدمات کاهش پینگ", path: "/Products?c=pingreduce" },
    {name: "اشتراک هوش مصنوعی", path: "/Products?c=ai" },
    {name: "گوگل پلی", path: "/Products?c=googleplay" },
    {name: "رایت گیمز", path: "/Products?c=riotgames" },
    {name: "بتل نت", path: "/Products?c=battlenet" },
    {name: "فری فایر", path: "/Products?c=freefire" },
    {name: "اپل", path: "/Products?c=apple" },
    {name: "پابجی", path: "/Products?c=pubg" },
    {name: "پلاتو", path: "/Products?c=plato" },
    {name: "سوپرسل", path: "/Products?c=supercell" },
    {name: "روبلاکس", path: "/Products?c=roblox" },
  ]
  return (
    <div className='flex items-center justify-around bg-bg-secondary h-20 hover:h-25 duration-300 transition-all fixed top-0 left-0 right-0 z-100' >
      <Link to="/"><img src={logo} alt="Lilith" className='h-20 hover:scale-103 transition-all duration-300'/></Link>
      <div className='flex gap-10 text-2xl max-lg:hidden '>
          <Link to="/Products?c=steam" className='hover:scale-103 transition-all duration-300'>خدمات استیم</Link>
          <Link to="/Products?c=minecraft" className='hover:scale-103 transition-all duration-300'>خدمات ماینکرفت</Link>
          <Link to="/Products?c=cod" className='hover:scale-103 transition-all duration-300'>خدمات کالاف دیوتی</Link>
          <div className="relative group pb-1">
              <Link to="/Products?c=all">سایر خدمات</Link>
              <div className="absolute top-full left-0 invisible opacity-0 w-0 overflow-hidden transition-all duration-300 ease-out group-hover:visible group-hover:opacity-100 group-hover:w-200">
                  <div className="grid grid-cols-3 gap-3 w-200 bg-bg-secondary p-5 rounded-2xl">
                      {pathsMap.map((path) => (<Link className="hover:scale-103 transition-all duration-300" key={path.path} to={path.path}>{path.name}</Link>))}
                  </div>
              </div>
          </div>
      </div>
      <Link to="/Dashboard" className='max-lg:hidden'>داشبورد</Link>
      <GiHamburgerMenu className='lg:hidden size-10 cursor-pointer' onClick={() => {setSideMenu(true)}}/>
      <div className={`lg:hidden flex flex-col absolute text-left bg-bg-secondary p-10 left-0 top-0 h-screen gap-2 items-center overflow-hidden transition-all duration-300 w-70 z-111 ${sideMenu ? "translate-x-0" : "-translate-x-full"}`}>
        <IoMdClose className='size-10 mb-8 cursor-pointer' onClick={() => {setSideMenu(false)}}/>
        <Link to="/Products?c=steam" className='hover:scale-103 transition-all duration-300' onClick={() => {setSideMenu(false)}}>خدمات استیم</Link>
        <Link to="/Products?c=minecraft" className='hover:scale-103 transition-all duration-300' onClick={() => {setSideMenu(false)}}>خدمات ماینکرفت</Link>
        <Link to="/Products?c=cod" className='hover:scale-103 transition-all duration-300' onClick={() => {setSideMenu(false)}}>خدمات کالاف دیوتی</Link>
        {pathsMap.map((path) => (
          <Link className="hover:scale-103 transition-all duration-300" key={path.path} to={path.path} onClick={() => {setSideMenu(false)}}>{path.name}</Link>
          ))}
      </div>
      {sideMenu && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-110' onClick={() => {setSideMenu(false)}}></div>
      )}
    </div>
  )
}

export default Header