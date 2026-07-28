import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import axios from "axios"
import Card from '../components/Card'
import { motion } from 'framer-motion'
import ParticleField from '../components/ParticleField'

const Products = () => {
  const [searchParams] = useSearchParams()
  const category = searchParams.get("c")
  document.title = `Lilith | ${category}`
    const [data, setData] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      setPage(1)
    }, [category])

    useEffect(() => {
      window.lenis?.scrollTo(0);
    }, [page])

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true)
        try{
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/category/${category}?page=${page}&limit=20`)
          if(response.data){
            setData(response.data.data)
            setTotalPages(response.data.pagination?.totalPages || 1)
          }
        }catch(err){
          setData([])
          console.log(err)
        }finally{
          setLoading(false)
        }
      }
      fetchData()
    },[category, page])

    useEffect(() => {
      window.lenis?.scrollTo(0, {
        immediate: true,
    });
    }, [])

  const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  }

  if(!loading && data.length < 1){
    return (
      <motion.div className='h-screen flex items-center justify-center text-1xl md:text-2xl text-text-secondary'>
        <div className='absolute bottom-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full bg-accent-primary/40 blur-[140px] -z-10' />
        <div className='absolute top-[0%] -right-[25%] -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full bg-accent-secondary/40 blur-[140px] -z-10' />
        <ParticleField className='absolute inset-0 z-10 h-full w-full right-100 top-100'/>
        <ParticleField className='absolute inset-0 z-10 h-full w-full right-100 top-0'/>
          هیچ محصولی در دسته بندی {category} وجود ندارد.
        </motion.div>
    )
  }

  return (
    <div className='flex flex-col items-center gap-20 mt-30 min-h-screen relative'>
      <div className='absolute bottom-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full bg-accent-primary/40 blur-[140px] -z-10' />
      <div className='absolute top-[0%] -right-[25%] -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full bg-accent-secondary/40 blur-[140px] -z-10' />
      <ParticleField className='absolute inset-0 z-10 h-full w-full right-100 top-100'/>
      <ParticleField className='absolute inset-0 z-10 h-full w-full right-100 top-0'/>
      {category?.toLocaleLowerCase() == "all" ?
      <motion.h1 initial={{opacity: 0, y: 20}} animate={{scale: 1, opacity: 1, y: 0}} transition={{duration: 0.6}} className='text-4xl font-bold'>تمام محصولات</motion.h1> :
      <motion.h1 initial={{opacity: 0, y: 20}} animate={{scale: 1, opacity: 1, y: 0}} transition={{duration: 0.6}} className='text-4xl font-bold'>محصولات  {category}</motion.h1>}
      <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{ duration: 0.6 }} className='grid gap-8 grid-cols-1 xl:grid-cols-4 md:grid-cols-2'>
        {data.map((product) => (
          <Card key={product.id} category={product.category} discount={JSON.parse(product.discount)} realDiscount={product.realDiscount} id={product.id} image={product.image} price={product.price} title={product.title}/>
        ))}
      </motion.div>

      {totalPages > 1 && (
        <div className='flex items-center gap-4 mb-20'>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className='bg-bg-secondary px-5 py-2 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition'
          >
            قبلی
          </button>
          <span className='text-text-secondary'>صفحه {page} از {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className='bg-bg-secondary px-5 py-2 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition'
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  )
}

export default Products