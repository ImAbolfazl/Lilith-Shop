import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import PriceSVG from './priceSVG'

const Card = ({discount, realDiscount, id, image, price, title, category}) => {
    const [timeLeft, setTimeLeft] = useState("")

    const getTimeLeft = () => {
        if (!discount?.expires) return ""

        const now = new Date()
        const expiry = new Date(discount.expires)

        const diff = expiry - now

        if (diff <= 0) {
            return ""
        }

        const seconds = Math.floor(diff / 1000)
        const days = Math.floor(seconds / 86400)
        const hours = Math.floor((seconds % 86400) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        if (days > 0) {
            return `${days}d ${hours}h`
        }

        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }

        if (minutes > 0) {
            return `${minutes}m`
        }

        return "Ending soon"
    }

    useEffect(() => {
        setTimeLeft(getTimeLeft())

        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft())
        }, 60000)

        return () => clearInterval(interval)
    }, [discount?.expires])


    const now = new Date()
    const expiry = discount?.expires ? new Date(discount.expires) : null

    let formatedPercent = discount?.percent || 0

    if (expiry && now > expiry) {
        formatedPercent = 0
    }

    const finalDiscount = formatedPercent + realDiscount

    let formatedPrice = Math.round(Number(price.initial))

    let formatedDiscountPrice
    
    if(price.initial == 0 && price.subs[Object.keys(price.subs)[0]][0].price){
        formatedPrice = price.subs[Object.keys(price.subs)[0]][0].price
    }

    if(formatedPrice == 0 && price.subs[Object.keys(price.subs)[0]][1].price){
        formatedPrice = price.subs[Object.keys(price.subs)[0]][1].price
    }
    
    if (finalDiscount > 0) {
        formatedDiscountPrice = Math.round(Number(price.initial * (1 - finalDiscount / 100))).toLocaleString("fa-IR")
    }else{
        formatedPrice = formatedPrice.toLocaleString("fa-IR")
    }

    return (
        <div className="relative h-60">

    {finalDiscount > 0 && (
        <div className="absolute -top-3 -right-3 z-10 flex flex-col items-center">
            <div className="bg-bg-secondary font-bold text-accent-secondary text-[14px] px-4 py-2 rounded-2xl rotate-12 shadow-lg">
                {finalDiscount}%
            </div>
        </div>
    )}
        {timeLeft && finalDiscount > 0 && (
        <div className="flex items-center gap-2 bg-bg-secondary font-bold px-4 py-2 text-accent-primary rounded-xl pxpy-1.5 w-fit absolute z-10 -top-3 -left-3">
            <span className="text-xs font-bold">
                {timeLeft} باقی مانده
            </span>
        </div>
    )}

    <Link
        to={`/product/${id}`}
        className="h-full relative flex flex-col gap-3 w-70 bg-bg-secondary rounded-3xl overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_2px_30px_rgba(168,85,247,0.35)] transition-all"
    >

        <div className="overflow-hidden object-cover h-[55%]">
            <img 
                src={`${import.meta.env.VITE_BACKEND_URL}${image}`} 
                alt={title} 
                className="rounded-t-3xl scale-100 group-hover:scale-105 duration-300"
            />
        </div>


        <div className="flex flex-col justify-between px-4 pb-3 h-[45%]">

            <p className="font-semibold line-clamp-2">
                {title}
            </p>


            <div className="flex flex-col gap-2">

                <div className="flex items-center justify-between">

                    {finalDiscount > 0 ? (
                        <div className="flex items-center gap-2">

                            <del className="text-text-secondary text-sm">
                                {formatedPrice}
                            </del>

                            <div className="flex items-center gap-2">
                                <p className="font-black text-xl text-accent-secondary">
                                    {formatedDiscountPrice}
                                </p>

                                <PriceSVG/>
                            </div>

                        </div>
                    ) : (

                        <div className="flex items-center gap-2">
                            <p className="font-black text-xl text-accent-secondary">
                                {formatedPrice}
                            </p>

                            <PriceSVG/>
                        </div>

                    )}

                </div>

            </div>

        </div>

    </Link>
</div>
    )
}

export default Card