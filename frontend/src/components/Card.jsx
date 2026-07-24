import React from 'react'
import { Link } from 'react-router'
import PriceSVG from './priceSVG'

const Card = ({banner, category, discount, id, image, info, price, steamId, title}) => {
    
    let formatedPrice = price[0].price.toLocaleString("fa-IR")
    let formatedDiscountPrice
    if(discount){
        formatedDiscountPrice = Math.round((price[0].price * (1 - discount / 100))).toLocaleString("fa-IR")
    }
    
  return (
    <div className="relative h-60">
        {discount > 0 && <p className='absolute bg-accent-primary/90 rounded-full p-2 z-10 rotate-27 -top-2 -right-2 font-bold'>{discount}%</p>}
        <Link to={`/product/${id}`} className='h-full relative flex flex-col gap-3 w-70 bg-card-primary rounded-3xl overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_2px_30px_rgba(168,85,247,0.35)] transition-all'>
            <div className="overflow-hidden object-cover h-[55%]"><img src={`${import.meta.env.VITE_BACKEND_URL}${image}`} alt={title} className='rounded-t-3xl scale-100 group-hover:scale-103 duration-300'/></div>
            <div className="flex flex-col justify-between px-4 pb-2 h-[45%]">
                <p>{title}</p>
                <div className='flex items-center gap-2'>{discount > 0 ? (
                        <div className="flex items-center gap-3">
                            <del className='text-text-secondary'>{formatedPrice}</del>
                            <div className='flex items-center gap-3'>
                                <p>{formatedDiscountPrice}</p>
                                <PriceSVG/>
                            </div>
                        </div>
                    ) :
                    <div className='flex items-center gap-3'>
                        <p>{formatedPrice}</p>
                        <PriceSVG/>
                    </div>
                }

                </div>
            </div>
        </Link>
    </div>
  )
}

export default Card