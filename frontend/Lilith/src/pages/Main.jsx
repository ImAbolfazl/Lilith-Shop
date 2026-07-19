import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import axios from "axios"
import Card from '../components/Card'
import ScrollContainer from "react-indiana-drag-scroll";
import "react-indiana-drag-scroll/dist/style.css";
import { Link } from 'react-router'
import { CgPlayTrackPrevR } from "react-icons/cg";

const Main = () => {
    document.title = "Lilith | Home"
    const [data, setData] = useState([]) 

    useEffect(() => {
      const fetchData = async () => {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/categories`)
        if(response.data){
          setData(response.data.data)
        }
      }
      fetchData()
    },[])
  return (
    <div className='mt-28 px-10'>
      {data.map((category) => (<div key={category.name}>
        <div>
          <p className='text-4xl'>{category.name}</p>
          <Link to={`/Products?c=${category.name}`} className='flex gap-1 items-center transition-all duration-300 hover:text-accent-primary'>مشاهده تمام محصولات <CgPlayTrackPrevR className='size-7'/></Link>
        </div>
        <ScrollContainer className='flex gap-5 no-scrollbar active:cursor-grabbing py-7 px-4'>
            {category.data.map((product) => (
              <Card key={product.id} banner={product.banner} category={product.category} discount={product.discount} discountPrice={product.discountPrice} id={product.id} image={product.image} info={product.info} price={product.price} steamId={product.steamId} title={product.title}/>
          ))}
        </ScrollContainer>
      </div>))}
    </div>
  )
}

export default Main