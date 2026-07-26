import React, {useEffect, useState} from 'react';
import {motion} from "framer-motion";
import Card from "../components/Card.jsx";
import axios from "axios";
import { useLocation } from 'react-router';


const Discounts = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    useEffect(() => {
        const fetchData = async () => {
            try{
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/discounts`)

                if(response.data){
                    setData(response.data.data)
                    setLoading(false)
                }
            }catch(error){
                console.log(error)
            }
        }

        fetchData()
    }, [])

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
            </div>
        );
    }
};

export default Discounts;