import React from 'react'
import { Link } from 'react-router' 
import logo from "../assets/logo.png"
import { IoMdClose } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState } from 'react';
import { FaMoon } from "react-icons/fa";
import { MdSunny } from "react-icons/md";

const Header = ({theme, setTheme}) => {
  const [sideMenu, setSideMenu] = useState(false)
  const pathsMap = [
    {name: "وورلد اف وارکرفت", path: "/Products?c=WoW" },
    {name: "دیسکورد", path: "/Products?c=Discord" },
    {name: "تلگرام", path: "/Products?c=Telegram" },
    {name: "کیک", path: "/Products?c=Kick" },
    {name: "اپیک گیمز", path: "/Products?c=EpicGames" },
    {name: "توییج", path: "/Products?c=Twitch" },
    {name: "اسپاتیفای", path: "/Products?c=Spotify" },
    {name: "پلی استیشین", path: "/Products?c=PlayStation" },
    {name: "خدمات کاهش پینگ", path: "/Products?c=PingReduction" },
    {name: "اشتراک هوش مصنوعی", path: "/Products?c=AI" },
    {name: "گوگل پلی", path: "/Products?c=GooglePlay" },
    {name: "رایت گیمز", path: "/Products?c=RiotGames" },
    {name: "بتل نت", path: "/Products?c=BattleNet" },
    {name: "فری فایر", path: "/Products?c=FreeFire" },
    {name: "اپل", path: "/Products?c=Apple" },
    {name: "پابجی", path: "/Products?c=Pubg" },
    {name: "پلاتو", path: "/Products?c=Plato" },
    {name: "سوپرسل", path: "/Products?c=Supercell" },
    {name: "روبلاکس", path: "/Products?c=Roblox" },
  ]

  const toggleTheme = () => {
      setTheme(prev => prev == "dark" ? "light" : "dark");
  }
  return (
    <div className='flex items-center justify-around h-20 hover:h-25 duration-300 transition-all fixed top-0 left-0 right-0 z-100 bg-bg-secondary/90 backdrop-blur-xl border-b border-black/5 shadow-sm' >
      <Link to="/"><img src={logo} alt="Lilith" className='h-20 hover:scale-103 transition-all duration-300'/></Link>
      <div className='flex gap-10 text-2xl max-lg:hidden '>
          <Link to="/Products?c=Steam" className='hover:scale-103 transition-all duration-300'>خدمات استیم</Link>
          <Link to="/Products?c=MineCraft" className='hover:scale-103 transition-all duration-300'>خدمات ماینکرفت</Link>
          <Link to="/Products?c=CallOfDuty" className='hover:scale-103 transition-all duration-300'>خدمات کالاف دیوتی</Link>
          <div className="relative group pb-1">
              <Link to="/Products?c=All">سایر خدمات</Link>
              <div className="absolute top-full left-0 origin-top-left invisible opacity-0 -translate-x-3 -translate-y-3 scale-95 pointer-events-none transition-all duration-300 ease-out group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto">
                  <div className="grid grid-cols-3 gap-3 w-200 bg-bg-secondary p-5 rounded-2xl">
                      {pathsMap.map((path) => (<Link className="hover:scale-103 transition-all duration-300" key={path.path} to={path.path}>{path.name}</Link>))}
                  </div>
              </div>
          </div>
      </div>
      <Link to="/Dashboard" className='max-lg:hidden text-3xl'>داشبورد</Link>
      {theme == "light" ?
      <MdSunny className='size-10 cursor-pointer' onClick={toggleTheme}/> :
      <FaMoon className='size-10 cursor-pointer' onClick={toggleTheme}/>}
      <GiHamburgerMenu className='lg:hidden size-10 cursor-pointer' onClick={() => {setSideMenu(true)}}/>
      <div className={`lg:hidden flex flex-col absolute text-left bg-bg-secondary p-10 left-0 top-0 h-screen gap-2 items-center overflow-hidden transition-all duration-300 w-70 z-111 ${sideMenu ? "translate-x-0" : "-translate-x-full"}`}>
        <IoMdClose className='size-10 mb-8 cursor-pointer' onClick={() => {setSideMenu(false)}}/>
        <Link to="/Products?c=Steam" className='hover:scale-103 transition-all duration-300' onClick={() => {setSideMenu(false)}}>خدمات استیم</Link>
        <Link to="/Products?c=MineCraft" className='hover:scale-103 transition-all duration-300' onClick={() => {setSideMenu(false)}}>خدمات ماینکرفت</Link>
        <Link to="/Products?c=CallOfDuty" className='hover:scale-103 transition-all duration-300' onClick={() => {setSideMenu(false)}}>خدمات کالاف دیوتی</Link>
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