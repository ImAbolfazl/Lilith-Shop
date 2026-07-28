import React, {useEffect, useState} from 'react';
import {motion} from "framer-motion";
import Card from "../components/Card.jsx";
import axios from "axios";
import { useLocation } from 'react-router';


const Discounts = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const { pathname } = useLocation();

    useEffect(() => {
        window.lenis?.scrollTo(0, {
            immediate: true,
        });
    }, [pathname])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try{
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/discounts?page=${page}&limit=20`)

                if(response.data){
                    setData(response.data.data)
                    setTotalPages(response.data.pagination?.totalPages || 1)
                }
            }catch(error){
                console.log(error)
            }finally{
                setLoading(false)
            }
        }

        fetchData()
    }, [page])

    if (loading) {
        return (
            <>
                <div className='flex items-center justify-center text-2xl h-screen opacity-70'>
                    درحال گرفتن اطلاعات...
                </div>
            </>
        )
    }

    if(data){
        return (
            <div className='flex justify-center flex-col items-center gap-20 mt-30'>
                <motion.h1 initial={{opacity: 0, y: 20}} animate={{scale: 1, opacity: 1, y: 0}} transition={{duration: 0.6}} className='text-4xl font-bold'>تخفیفات</motion.h1>
                <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{ duration: 0.6 }} className='grid gap-8 grid-cols-1 xl:grid-cols-4 md:grid-cols-2'>
                    {data.map((product) => (
                        <Card key={product.id} banner={product.banner} category={product.category} discount={JSON.parse(product.discount)} realDiscount={product.realDiscount} id={product.id} image={product.image} info={product.info} price={product.price} steamId={product.steamId} title={product.title}/>
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
        );
    }
};

export default Discounts;