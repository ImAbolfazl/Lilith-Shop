import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router'
import axios from "axios"
import PriceSVG from '../components/priceSVG'

const Product = () => {
  const id = useParams().id
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [region, setRegion] = useState()
  
  useEffect(() => {
    const fetchData = async () => {
      try{
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/product/${id}`)
        if(response.data){
          setData(response.data.data)
          setLoading(false)
        }
      }catch(err){
        console.log(err);
      }
    }
    
    fetchData()
  }, [])
  
  useEffect(() => {
    console.log(data);
    if(data){
      document.title = `Lilith | ${data && data.title}` 
      setRegion(data.price[0].country[0])
    }
  }, [data])

  if(loading){
    return <div className='flex items-center justify-center text-3xl h-screen'>
        درحال گرفتن اطلاعات...
      </div>
  }
  
  if(!loading && data){
    return <div className="relative h-[80vh] rounded-3xl overflow-hidden flex items-center justify-center flex-col" style={{backgroundImage: `linear-gradient(to top, var(--color-bg-primary) 0%, transparent 50%), ${data.steamId ? `url(${data.banner})` : `url(${import.meta.env.VITE_BACKEND_URL}${data.banner}`}`, backgroundSize: "cover", backgroundPosition: "center"}}>
      <h1 className='text-5xl font-bold'>{data.title}</h1>
      <div className='flex gap-3'>
        {data.price.map((price) => (
          <p className='bg-bg-secondary py-3 px-4 rounded-2xl cursor-pointer'>{price.persian}</p>
        ))}
      </div>
      <div className='flex items-center gap-3 text-2xl'>
        {data.price.map((price) => (
          price.country[0] == region && <p>{price.price.toLocaleString("fa-IR")}</p>
        ))}
        <PriceSVG/>
      </div>




      {/* <div dir='ltr' dangerouslySetInnerHTML={{__html: data.info}}/> */}
      {/* <div>
        <div className="prose prose-invert max-w-none flex flex-col items-center dir-ltr" dir='ltr' dangerouslySetInnerHTML={{__html: data.recommended}}/>
        <div className="prose prose-invert max-w-none flex flex-col items-center dir-ltr" dir='ltr' dangerouslySetInnerHTML={{__html: data.minimum}}/>
      </div> */}
      </div>
  }
}

export default Product