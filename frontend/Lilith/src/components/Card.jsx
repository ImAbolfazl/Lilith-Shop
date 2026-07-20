import React from 'react'
import { Link } from 'react-router'
import { getImageUrl } from '../utils/imageUrl'
import PriceSVG from './priceSVG'

const Card = ({banner, category, discount, id, image, info, price, steamId, title}) => {
    
    let formatedPrice = price[0].price.toLocaleString("fa-IR")
    let formatedDiscountPrice
    if(discount){
        formatedDiscountPrice = Math.round((price[0].price * (1 - discount / 100))).toLocaleString("fa-IR")
    }
    
  return (
    <Link to={`/product/${id}`} className='relative flex flex-col gap-3 w-70 bg-card-primary rounded-3xl p-3 h-auto group shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_2px_30px_rgba(168,85,247,0.35)] transition-all shrink-0'>
        {discount > 0 && <p className='absolute bg-accent-primary/90 rounded-full p-2 z-10 rotate-27 -top-2 -right-2 font-bold'>{discount}%</p>}
        <img src={getImageUrl(image)} alt={title} className='rounded-t-3xl group-hover:scale-102 duration-300'/>
        <div>
            <p>{title}</p>
            <div className='flex items-center gap-2'>{discount > 0 ? (
                <div>
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
  )
}

export default Card