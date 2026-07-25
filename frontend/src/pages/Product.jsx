import React, {useEffect, useState} from 'react';
import {Link, useLocation, useParams} from "react-router";
import axios from "axios";
import {motion} from "framer-motion";
import PriceSVG from "../components/PriceSVG.jsx";
import { FaMicrochip } from "react-icons/fa6";

const Product = () => {
    const [loading, setLoading] = useState(true)
    const [region, setRegion] = useState()
    const [data, setData] = useState(null)
    const id = useParams().id
    const { pathname } = useLocation();
    let [discount, setDiscount] = useState()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try{
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/product/${id}`)

                if(response.data){
                    setData(response.data.data)
                    setLoading(false)
                }
            }catch(err){
                console.log(err)
            }
        }

        fetchData()
    }, []);

    useEffect(() => {
        if(data){
            setRegion(Object.keys(data.price.subs)[0])
            setDiscount(data.discount + data.realDiscount)
        }
    }, [data]);

    if(loading){
        return <div className="flex justify-center items-center h-screen">
            درحال دریافت اطلاعات...
        </div>
    }

    if(data){
        return (<>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 0.8 }}
                className="h-[70vh] overflow-hidden relative z-4"
                style={{
                    backgroundImage: `linear-gradient(to top, var(--color-bg-primary) 0%, transparent 70%), url(${import.meta.env.VITE_BACKEND_URL}${data.banner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            />
            <div className="px-6 lg:px-40 -mt-90 z-5 relative gap-10 flex flex-col">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className='flex justify-between items-center max-md:flex-col max-md:gap-10'
                >
                    <div className='flex flex-col gap-5'>
                        <img className='w-70 object-cover rounded-2xl' src={`${import.meta.env.VITE_BACKEND_URL}${data.image}`} alt={data.title} />
                        <h1 className="text-4xl">{data.title}</h1>
                    </div>
                    <div className='flex gap-8 items-center'>
                        <div>
                            <p className='text-text-secondary text-[12px]'>DLC</p>
                            <p className='text-xl'>{data.dlc}</p>
                        </div>
                        <div>
                            <p className='text-text-secondary text-[12px]'>دسته بندی</p>
                            <Link to={`/Products?c=${data.category}`} className='text-xl hover:text-text-primary/80 duration-300'>{data.category}</Link>
                        </div>
                        <div>
                            <p className='text-text-secondary text-[12px]'>انتشار دهنده</p>
                            <p className='text-xl'>{data.publisher}</p>
                        </div>
                        {data.minimum &&
                            <a href="#requiredSys" className="text-text-secondary text-xl hover:text-text-primary duration-200">سیستم پیشنهادی</a>
                        }
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="flex flex-col gap-4"
                >
                    <p>لطفا ریجن مورد نظر خود را وارد کنید</p>
                    <div className="md:flex gap-3 grid grid-cols-2">
                        {Object.keys(data.price.subs).map((item) => (
                            <p key={Math.random()} onClick={() => setRegion(item)} className={`bg-bg-secondary hover:bg-bg-secondary/70 duration-200 px-6 py-2 rounded-2xl cursor-pointer flex items-center gap-3 justify-center ${region === item ? "border border-white" : "border border-bg-secondary"}`} ><img className='w-6 rounded-2xl' src={`https://flagsapi.com/${data.price.subs[item][0].tag}/flat/32.png`} alt={item} />{item}</p>
                        ))}
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="md:w-[70vw] bg-bg-secondary p-2 rounded-xl flex flex-col gap-2 relative"
                >
                    {discount > 0 && <p className='absolute -top-4 -left-4 text-xl bg-accent-primary p-2 rounded-full -rotate-27 z-999'>{discount}%-</p>}
                    {data.price.subs[region] && data.price.subs[region].map((item) => (
                        <div key={Math.random()} className="flex justify-between w-full bg-bg-primary p-4 cursor-pointer rounded-xl items-center border border-bg-secondary hover:border-accent-primary/50 hover:bg-bg-primary/80 duration-300 max-md:flex-col gap-2">
                            <p className='md:hidden text-center'>{item.name}</p>
                            <div className='flex justify-between w-full items-center'>
                                <p className='flex gap-2 md:gap-0 md:flex-col items-center'><img className='w-6' src={`https://flagsapi.com/${item.tag}/flat/32.png`} alt={item.tag} />{region}</p>
                                <p className='hidden md:block text-center'>{item.name}</p>
                                <div>
                                    {discount > 0 ? (<>
                                        {console.log(discount)}
                                        <del className='text-10 text-text-secondary'>{Math.floor(item.price / (1 - discount / 100)).toLocaleString("fa-IR")}</del>
                                        <p className='text-xl flex items-center gap-2'>{item.price.toLocaleString("fa-IR")} <PriceSVG/></p>
                                    </>): (
                                        <p className='text-xl flex items-center gap-2'>{item.price.toLocaleString("fa-IR")} <PriceSVG/></p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className='flex flex-col gap-2'
                >
                    <p className='text-xl text-red-600'>توجه!</p>
                    <p>قبل از ثبت سفارش <Link target='_blank' to="/steam-guard" className="text-red-600 border-b">استیم گارد</Link> خودتون رو خاموش کنید</p>
                    <p>اگه ریجن اکانتتون ایران باشه میتونید هر ریجنی خواستید سفارش بدید.</p>
                    <p>قیمت های وبسایت هر 10 ساعت یکبار بروز میشوند! بررسی تخفیفات قبل از خرید بر عهده کاربر میباشید (فقط تخفیفات استیم)</p>
                    <p>تمامی محصولات دیجیتال بوده و نسخه فیزیکی برای شما ارسال نمیشود.</p>
                    <p>اطلاعات خود را قبل از ثبت سفارش بررسی کنید. اطلاعات بعد از ثبت قابل تغییر نیستند.</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className='md:flex md:flex-row flex flex-col gap-40 text-left mt-10 scroll-mt-60 w-screen justify-center xl:pl-100 pl-10'
                    id='requiredSys'
                >
                    <div className='flex flex-col gap-3'>
                        <p className='flex items-center gap-2'><FaMicrochip/> سیستم پیشنهادی:</p>
                        <div
                        className="prose prose-invert max-w-none dir-ltr text-rtl"
                        dangerouslySetInnerHTML={{ __html: data.recommended }}
                        />
                    </div>
                    <div className='flex flex-col gap-3'>
                        <p className='flex items-center gap-2'><FaMicrochip/> حداقل سیستم مورد نیاز:</p>
                        <div
                        className="prose prose-invert max-w-none dir-ltr text-rtl"
                        dangerouslySetInnerHTML={{ __html: data.minimum }}
                    />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.6 }}
                    dir='ltr'
                    className={`p-5 [&_img]:rounded-xl [&_img]:h-28 [&_video]:rounded-xl [&_video]:h-48 flex flex-col gap-6 ${data.steamId ? "text-left" : "text-right rlt"}`}
                    dangerouslySetInnerHTML={{ __html: data.info }}
                />
            </div>
        </>);
    }
};

export default Product;