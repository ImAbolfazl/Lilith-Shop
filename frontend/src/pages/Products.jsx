import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import axios from "axios"
import Card from '../components/Card'

const Products = () => {
  const [searchParams] = useSearchParams()
  const category = searchParams.get("c")
  document.title = `Lilith | ${category}`
    const [data, setData] = useState([])
    useEffect(() => {
      const fetchData = async () => {
        try{
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/category/${category}`)
          if(response.data){
            setData(response.data.data)
          }
        }catch(err){
          setData([])
          console.log(err)
        }
      }
      fetchData()
    },[category])
  return (
    <div className='flex justify-center flex-col items-center gap-20 mt-30'>
      {category.toLocaleLowerCase() == "all" ?
      <h1 className='text-4xl font-bold'>تمام محصولات</h1> :
      <h1 className='text-4xl font-bold'>محصولات  {category}</h1>}
      <div className='grid gap-8 grid-cols-1 xl:grid-cols-4 md:grid-cols-2'>
        {data.map((product) => (
          <Card key={product.id} banner={product.banner} category={product.category} discount={product.discount} id={product.id} image={product.image} info={product.info} price={product.price} steamId={product.steamId} title={product.title}/>
        ))}
      </div>
    </div>
  )
}

export default Products