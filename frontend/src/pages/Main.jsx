import React, { useState, useEffect } from 'react'
import axios from "axios"
import { motion, useReducedMotion } from 'framer-motion'
import Card from '../components/Card'
import ParticleField from '../components/ParticleField'
import ScrollContainer from "react-indiana-drag-scroll"
import "react-indiana-drag-scroll/dist/style.css"
import { Link, useLocation } from 'react-router'
import { CgPlayTrackPrevR } from "react-icons/cg"
import MaskRevealText from "../components/Maskrevealtext.jsx";

const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.08 },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

const CategorySkeleton = () => (
    <div className='flex gap-5 py-7 px-4'>
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='w-56 h-72 rounded-2xl bg-bg-secondary/60 animate-pulse shrink-0' />
        ))}
    </div>
)

const Main = () => {
    document.title = "Lilith | Home"
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const reduceMotion = useReducedMotion()
    const { pathname } = useLocation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/categories`)
                if (response.data) {
                    setData(response.data.data)
                }
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])
    
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return (
        <div className='relative overflow-hidden'>
            <section className='relative flex flex-col items-center justify-center text-center px-6 pt-40 pb-28'>
                <ParticleField className='absolute inset-0 -z-10 h-full w-full opacity-70' />
                <div className='absolute inset-0 -z-10 bg-gradient-to-b from-bg-primary via-bg-primary/95 to-bg-primary' />
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full bg-accent-primary/20 blur-[140px] -z-10' />

                <motion.h1
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className='text-5xl md:text-7xl font-bold text-text-primary leading-[1.2]'
                >
                    دنیای گیمینگ، <MaskRevealText baseText="یک کلیک" revealText="لیلیث" radius={80} /> با تو فاصله داره
                </motion.h1>

                <motion.p
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className='text-text-primary/70 max-w-xl mt-6 text-lg'
                >
                    خدمات دیجیتال
                    <br/>
                    تحویل آنی، با پایین ترین قیمت
                </motion.p>
            </section>

            <div className='px-10 pb-24 flex flex-col gap-20'>
                {loading &&
                    Array.from({ length: 2 }).map((_, i) => <CategorySkeleton key={i} />)}

                {!loading && data.map((category) => (
                    <motion.div
                        key={category.name}
                        variants={sectionVariants}
                        initial='hidden'
                        whileInView='visible'
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        <motion.div variants={itemVariants} className='flex items-end justify-between'>
                            <div>
                                <p className='text-4xl font-bold text-text-primary'>{category.name}</p>
                                <div className='h-[3px] w-14 mt-3 rounded-full bg-gradient-to-l from-accent-primary to-transparent' />
                            </div>
                            <Link
                                to={`/Products?c=${category.name}`}
                                className='group flex gap-1 items-center text-text-primary/70 transition-all duration-300 hover:text-accent-primary'
                            >
                                مشاهده تمام محصولات
                                <CgPlayTrackPrevR className='size-7 transition-transform duration-300 group-hover:-translate-x-1' />
                            </Link>
                        </motion.div>

                        <ScrollContainer className='flex gap-5 no-scrollbar active:cursor-grabbing py-7 px-4'>
                            {category.data.map((product) => (
                                <motion.div
                                    key={product.id}
                                    variants={itemVariants}
                                    className='shrink-0'
                                >
                                    <Card
                                        category={product.category}
                                        discount={product.discount}
                                        realDiscount={product.realDiscount}
                                        id={product.id}
                                        image={product.image}
                                        price={product.price}
                                        title={product.title}
                                    />
                                </motion.div>
                            ))}
                        </ScrollContainer>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default Main