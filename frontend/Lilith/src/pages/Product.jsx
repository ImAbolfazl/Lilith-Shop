import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router'
import axios from "axios"

const Product = () => {
  const id = useParams().id
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  document.title = `Lilith | ${data.title}`

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
    
  })

  if(loading){
    return <div className='flex items-center justify-center text-3xl h-screen'>
        درحال گرفتن اطلاعات...
      </div>
  }
  
  if(!loading && data){
    return <div
    className="relative h-[80vh] rounded-3xl overflow-hidden opacity-40"
    style={{
    backgroundImage: `
      linear-gradient(
        to top,
        var(--color-bg-primary) 0%,
        transparent 50%
      ),
      ${data.steamId ? `url(${data.banner})` : `url(${import.meta.env.VITE_BACKEND_URL}${data.banner}`}
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
  >
  </div>
  }
}

export default Product