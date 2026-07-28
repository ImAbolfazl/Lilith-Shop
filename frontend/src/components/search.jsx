import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { Link } from "react-router";
import PriceSVG from "./priceSVG";

const getPricing = (item) => {
    const discount = item.discount ? JSON.parse(item.discount) : null;
    const realDiscount = item.realDiscount || 0;
    const price = item.price;

    const now = new Date();
    const expiry = discount?.expires ? new Date(discount.expires) : null;

    let formatedPercent = discount?.percent || 0;
    if (expiry && now > expiry) {
        formatedPercent = 0;
    }

    const finalDiscount = formatedPercent + realDiscount;

    let formatedPrice = Math.round(Number(price.initial)).toLocaleString("fa-IR");
    let formatedDiscountPrice;

    if (finalDiscount > 0) {
        formatedDiscountPrice = Math.round(
            Number(price.initial * (1 - finalDiscount / 100))
        ).toLocaleString("fa-IR");
    }

    if (price.initial == 0) {
        formatedPrice = price.subs[Object.keys(price.subs)[0]][0].price.toLocaleString("fa-IR");
        if (finalDiscount > 0) {
            formatedDiscountPrice = Math.round(
                Number(formatedPrice * (1 - finalDiscount / 100))
            ).toLocaleString("fa-IR");
        }
    }

    return { finalDiscount, formatedPrice, formatedDiscountPrice };
};

const Search = ({ toggleSearch }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.trim() === "") {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timeout = setTimeout(async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/products/search?q=${encodeURIComponent(query)}`
                );
                setResults(response.data.data || []);
            } catch (err) {
                console.error(err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 350);

        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <motion.div initial={{ opacity: 0, y: -1000 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -1000 }} transition={{ duration: 0.35 }} className="fixed top-0 left-0 right-0 z-[9999] bg-bg-secondary overflow-y-auto h-screen">
            <IoMdClose size={42} onClick={toggleSearch} className="absolute top-8 left-8 cursor-pointer hover:rotate-90 transition duration-300" />

            <div className="w-full flex flex-col items-center pt-24 pb-20">
                <h1 className="text-5xl font-black mb-10">جستجوی بازی</h1>

                <div className="relative w-[90%] max-w-5xl mb-10">
                    <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-text-secondary text-xl" />
                    <input type="text" placeholder="نام محصول مورد نظر خود را وارد کنید..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-bg-primary border border-white/10 focus:border-accent-secondary rounded-2xl pl-16 pr-6 py-5 text-xl outline-none transition shadow-2xl" />
                </div>

                <div className="w-[90%] max-w-5xl flex flex-col gap-5 overflow-scroll p-5" data-lenis-prevent>
                    {query === "" ? (
                        <div className="text-center text-text-secondary mt-20 text-2xl">برای شروع جستجو، نام محصول را وارد کنید.</div>
                    ) : loading ? (
                        <div className="text-center text-text-secondary mt-20 text-2xl">درحال جستجو...</div>
                    ) : results.length === 0 ? (
                        <div className="text-center text-text-secondary mt-20 text-2xl">بازی‌ای پیدا نشد.</div>
                    ) : (
                        results.map((item) => {
                            const { finalDiscount, formatedPrice, formatedDiscountPrice } = getPricing(item);

                            return (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Link
                                        data-lenis-prevent
                                        to={`/product/${item.id}`}
                                        onClick={toggleSearch}
                                        className="group flex flex-col md:flex-row bg-bg-primary rounded-3xl overflow-hidden border border-white/5 hover:border-accent-secondary shadow-xl transition-all duration-300"
                                    >
                                        <img
                                            src={`${import.meta.env.VITE_BACKEND_URL}${item.image}`}
                                            alt={item.title}
                                            className="w-full h-48 md:w-52 md:h-32 object-cover group-hover:scale-105 transition duration-300"
                                        />

                                        <div className="flex flex-col justify-between flex-1 p-5 md:p-6">
                                            <div>
                                                <h2 className="text-xl md:text-3xl font-bold group-hover:text-accent-secondary transition">
                                                    {item.title}
                                                </h2>

                                                <div className="flex gap-2 md:gap-3 mt-4 flex-wrap">
                                                    <span className="bg-bg-secondary px-3 py-1 rounded-xl text-xs md:text-sm">
                                                        {item.publisher}
                                                    </span>

                                                    <span className="bg-bg-secondary px-3 py-1 rounded-xl text-xs md:text-sm">
                                                        {item.category}
                                                    </span>

                                                    {item.dlc === "دارد" && (
                                                        <span className="bg-accent-secondary/20 text-accent-secondary px-3 py-1 rounded-xl text-xs md:text-sm">
                                                            DLC
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end px-5 pb-5 md:pb-0 gap-3">
                                            {finalDiscount > 0 && (
                                                <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-sm md:text-base">
                                                    %{finalDiscount}-
                                                </span>
                                            )}

                                            <div className="text-right flex items-center gap-2">
                                                {finalDiscount > 0 && (
                                                    <del className="text-text-secondary text-sm">
                                                        {formatedPrice}
                                                    </del>
                                                )}
                                                <div>
                                                    <p className="text-2xl md:text-3xl font-black text-accent-secondary">
                                                        {finalDiscount > 0 ? formatedDiscountPrice : formatedPrice}
                                                    </p>

                                                    <p className="text-xs md:text-sm text-text-secondary">
                                                        تومان
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Search;