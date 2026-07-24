import React, {useEffect, useState} from 'react';
import {useParams} from "react-router";
import axios from "axios";

const Product = () => {
    const [data, setData] = useState()
    const [loading, setLoading] = useState(true)
    const [region, setRegion] = useState()
    const id = useParams().id


    useEffect(() => {
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
            setRegion()
            console.log(data.price.subs)
            console.log(typeof data.price.subs)
        }
    }, [data]);

    if(loading){
        return <div className="flex justify-center items-center h-screen">
            درحال دریافت اطلاعات...
        </div>
    }

    return (<>
        <div
            className="h-[70vh] overflow-hidden relative opacity-60 z-4"
            style={{
                backgroundImage: `linear-gradient(to top, var(--color-bg-primary) 0%, transparent 70%), url(${import.meta.env.VITE_BACKEND_URL}${data.banner})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}
        />



        <div className="px-40 mt-[-250px] z-5 relative">
            <h1 className="text-4xl">{data.title}</h1>

            <div
                className='md:flex md:flex-row flex flex-col gap-10 text-left mt-10 scroll-mt-[35vh]'
                id='requiredSys'
            >
                <div
                    className="prose prose-invert max-w-none dir-ltr text-rtl"
                    dangerouslySetInnerHTML={{ __html: data.recommended }}
                />
                <div
                    className="prose prose-invert max-w-none dir-ltr text-rtl"
                    dangerouslySetInnerHTML={{ __html: data.minimum }}
                />
            </div>

            <div
                dir='ltr'
                className={`p-5 [&_img]:rounded-xl [&_img]:h-28 [&_video]:rounded-xl [&_video]:h-48 flex flex-col gap-6 ${data.steamId ? "text-left" : "text-right rlt"}`}
                dangerouslySetInnerHTML={{ __html: data.info }}
            />
        </div>
    </>);
};

export default Product;