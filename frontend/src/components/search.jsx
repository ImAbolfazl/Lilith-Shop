import React, { useContext, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { UserContext } from "../App.jsx";
import { Link } from "react-router";

const Search = ({ toggleSearch }) => {
    const { allGames } = useContext(UserContext);
    const [query, setQuery] = useState("");

    const searchFilter = allGames.filter(item => query !== "" && item.title.toLowerCase().includes(query.toLowerCase()));

    return (
        <motion.div initial={{ opacity: 0, y: -1000 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -1000 }} transition={{ duration: 0.35 }} className="absolute top-0 left-0 right-0 z-[998] bg-bg-secondary overflow-y-auto h-screen">
            <IoMdClose size={42} onClick={toggleSearch} className="absolute top-8 left-8 cursor-pointer hover:rotate-90 transition duration-300" />

            <div className="w-full flex flex-col items-center pt-24 pb-20">
                <h1 className="text-5xl font-black mb-10">جستجوی بازی</h1>

                <div className="relative w-[90%] max-w-5xl mb-10">
                    <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-text-secondary text-xl" />
                    <input type="text" placeholder="نام بازی مورد نظر خود را وارد کنید..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-bg-primary border border-white/10 focus:border-accent-secondary rounded-2xl pl-16 pr-6 py-5 text-xl outline-none transition shadow-2xl" />
                </div>

                <div className="w-[90%] max-w-5xl flex flex-col gap-5">
                    {query === "" ? (
                        <div className="text-center text-text-secondary mt-20 text-2xl">برای شروع جستجو، نام بازی را وارد کنید.</div>
                    ) : searchFilter.length === 0 ? (
                        <div className="text-center text-text-secondary mt-20 text-2xl">بازی‌ای پیدا نشد.</div>
                    ) : (
                        searchFilter.map((item) => (
                            <motion.div key={item.id} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                                <Link to={`/product/${item.id}`} onClick={toggleSearch} className="group flex items-center bg-bg-primary rounded-3xl overflow-hidden border border-white/5 hover:border-accent-secondary shadow-xl transition-all duration-300">
                                    <img src={`${import.meta.env.VITE_BACKEND_URL}${item.image}`} alt={item.title} className="w-52 h-32 object-cover group-hover:scale-105 transition duration-300" />

                                    <div className="flex flex-col justify-between flex-1 p-6">
                                        <div>
                                            <h2 className="text-3xl font-bold group-hover:text-accent-secondary transition">{item.title}</h2>

                                            <div className="flex gap-3 mt-4 flex-wrap">
                                                <span className="bg-bg-secondary px-3 py-1 rounded-xl text-sm">{item.publisher}</span>
                                                <span className="bg-bg-secondary px-3 py-1 rounded-xl text-sm">{item.category}</span>
                                                {item.dlc === "دارد" && <span className="bg-accent-secondary/20 text-accent-secondary px-3 py-1 rounded-xl text-sm">DLC</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center items-end px-8 gap-3">
                                        {item.discount > 0 && <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-xl">%{item.discount}-</span>}

                                        <div className="text-right">
                                            <p className="text-3xl font-black text-accent-secondary">{item.price[0]?.price?.toLocaleString()}</p>
                                            <p className="text-sm text-text-secondary">تومان</p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Search;