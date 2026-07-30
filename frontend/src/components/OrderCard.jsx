import React from 'react'
import { FaTrash } from 'react-icons/fa'
import PriceSVG from './priceSVG'

const OrderCard = ({order}) => {
    const totalDiscount = JSON.parse(order.product.discount).expires && JSON.parse(order.product.discount).expires + order.realDiscount
    const price = order.product.price.subs[order.info.region][0].price

    return (
        <div
            key={order.id}
            className="bg-bg-secondary rounded-2xl p-4 flex items-center gap-4 border border-text-primary/10"
        >
            {order.product?.image && (
                <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${order.product.image}`}
                    alt={order.product.title}
                    className="w-16 h-16 object-cover rounded-xl"
                />
            )}
            <div className="flex-1">
                <p className="font-bold">{order.product?.title || `محصول #${order.productId}`}</p>
                <p className="text-sm text-text-secondary">تعداد: {order.quantity}</p>
                {order.info?.region && (
                    <p className="text-sm text-text-secondary">ریجن: {order.info.region}</p>
                )}
            </div>
            {order.product.price && (
                <div className="flex items-center gap-2 font-bold">
                    <span>
                        {totalDiscount > 0 ? price * (1 - totalDiscount / 100).toLocaleString("fa-IR") : price.toLocaleString("fa-IR")}
                    </span>
                    <PriceSVG />
                </div>
            )}
            <button
                onClick={() => handleDeleteOrder(order.id)}
                className="text-red-400 hover:text-red-500 p-2"
                aria-label="حذف سفارش"
            >
                <FaTrash />
            </button>
        </div>
    )
}

export default OrderCard