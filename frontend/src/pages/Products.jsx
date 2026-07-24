import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import axios from "axios"
import Card from '../components/Card'
import { motion } from 'framer-motion'

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

  const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  }

  return (
    <div className='flex justify-center flex-col items-center gap-20 mt-30'>
      {category.toLocaleLowerCase() == "all" ?
      <motion.h1 initial={{opacity: 0, y: 20}} animate={{scale: 1, opacity: 1, y: 0}} transition={{duration: 0.6}} className='text-4xl font-bold'>تمام محصولات</motion.h1> :
      <motion.h1 initial={{opacity: 0, y: 20}} animate={{scale: 1, opacity: 1, y: 0}} transition={{duration: 0.6}} className='text-4xl font-bold'>محصولات  {category}</motion.h1>}
      <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{ duration: 0.6 }} className='grid gap-8 grid-cols-1 xl:grid-cols-4 md:grid-cols-2'>
        {data.map((product) => (
          <Card key={product.id} category={product.category} discount={product.discount} id={product.id} image={product.image} price={product.price} title={product.title}/>
        ))}
      </motion.div>
    </div>
  )
}

export default Products