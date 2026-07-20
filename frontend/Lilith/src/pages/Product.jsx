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

  const calculateDiscount = (price, data) => {
    let finalPrice
    if(data.discount > 0){
      finalPrice = Math.round((price.price * (1 - data.discount / 100)))
    }else{
      finalPrice = price.price
    }

    return finalPrice.toLocaleString("fa-IR")
  }

  if(loading){
    return <div className='flex items-center justify-center text-3xl h-screen'>
        درحال گرفتن اطلاعات...
      </div>
  }
  
  if(!loading && data){
    return<><div className="h-[80vh] w-screen rounded-3xl overflow-hidden relative" style={{backgroundImage: `linear-gradient(to top, var(--color-bg-primary) 0%, transparent 50%), ${data.steamId ? `url(${data.banner})` : `url(${import.meta.env.VITE_BACKEND_URL}${data.banner}`}`, backgroundSize: "cover", backgroundPosition: "center"}}></div>
    <div className='relative z-20 -mt-100 px-6 md:px-12 pb-10 flex flex-col gap-20'>
      <h1 className='md:text-5xl text-3xl font-bold'>{data.title}</h1>
      <div className='flex items-center gap-10 flex-col'>
        <div className='flex flex-col gap-2'>
          ریجن اکانت خودتون رو انتخاب کنید:
          <div className='flex gap-3'>
            {data.price.map((price) => (
              <p className={`bg-bg-secondary py-3 px-4 rounded-2xl cursor-pointer ${price.country == region && "border-2 border-text-primary"}`} key={price.country[0]} onClick={() => setRegion(price.country)}>{price.persian}</p>
            ))}
          </div>
        </div>
        <div className='flex items-center gap-3 text-2xl'>
          {data.price.map((price) => (
            price.country[0] == region && <p key={price.country[0]}>{calculateDiscount(price, data)}</p>
          ))}
          <PriceSVG/>
        </div>
      </div>
      <div className='flex gap-10'>
        <div>
          <p className='text-text-secondary text-[12px]'>دسته بندی:</p>
          <p className='text-[18px]'>{data.category}</p>
        </div>
        <div>
          <p className='text-text-secondary text-[12px]'>سازنده:</p>
          <p className='text-[18px]'>{data.publisher}</p>
        </div>
        <div>
          <p className='text-text-secondary text-[12px]'>DLC:</p>
          <p className='text-[18px]'>{data.dlc}</p>
        </div>
        {data.category == "Steam" && <div>
          <a href='#requiredSys' className='text-[18px] text-text-secondary'>سیستم مورد نیاز</a>
        </div>}
      </div>
      <div>
        <p className='text-2xl font-bold text-red-600'>اگر DLC بازی رو میخواید لطفا به پشتیبانی پیام بدید.</p>
        {data.category == "Steam" && (<>
          <p className='flex items-center gap-1'><span className='text-red-600 text-xl'>توجه!</span> اگر ریجن اکانتتون ایران باشه میتونید هر ریجنی خواستید انتخاب کنید.</p>
          <p>قبل از سفارش استیم گارد خودتون رو خاموش کنید</p>
        </>)}
      <div className='md:flex gap-5 text-center #requiredSys'>
        <div className="prose prose-invert max-w-none flex flex-col items-center dir-ltr" dangerouslySetInnerHTML={{__html: data.recommended}}/>
        <div className="prose prose-invert max-w-none flex flex-col items-center dir-ltr" dangerouslySetInnerHTML={{__html: data.minimum}}/>
      </div>
      </div>
      <div dir='ltr' className='p-5 [&_img]:rounded-2xl [&_img]:h-24 [&_img]:w-fit [&_video]:rounded-2xl [&_video]:h-40 [&_video]:w-fit flex flex-col gap-4' dangerouslySetInnerHTML={{__html: data.info}}/>
    </div>
  </>}
}

export default Product