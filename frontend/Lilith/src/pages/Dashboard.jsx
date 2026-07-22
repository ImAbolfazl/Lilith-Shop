import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { UserContext } from '../App';
import { useNavigate } from 'react-router';
import { motion } from "framer-motion";
import { FaShoppingCart, FaUser, FaStar, FaCrown, FaSignOutAlt } from "react-icons/fa";

const Dashboard = () => {
    document.title = "Lilith | Dashboard";
    const [selected, setSelected] = useState("سبد خرید")
    const { token, setToken, user } = useContext(UserContext)
    const navigate = useNavigate()


    useEffect(() => {
        if (!token) {
            navigate("/")
        }
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData();
        formData.append('title', form.title.value);
        formData.append('category', form.category.value);
        formData.append('publisher', form.publisher.value);
        formData.append('dlc', form.dlc.value);
        formData.append('price', form.price.value);
        formData.append('currency', form.currency.value);
        formData.append('info', form.info.value);


        if (form.image.files[0]) {
            formData.append('image', form.image.files[0]);
        }
        if (form.banner.files[0]) {
            formData.append('banner', form.banner.files[0]);
        }

        try {
            await axios({
                method: "post",
                url: `${import.meta.env.VITE_BACKEND_URL}/api/products`,
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Product uploaded successfully!");
            // form.reset()
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        }
    };

    return (
        <div className='flex items-center justify-center h-screen flex-col'>
            {selected == "سبد خرید" &&
                <div className='md:w-[80vw]  max-md:h-[95vh] flex items-center justify-center h-full'>
                    <p>سبد خرید</p>
                </div>
            }
            {selected == "اطلاعات کاربر" &&
                <div className='md:w-[80vw]  max-md:h-[95vh] flex items-center justify-center h-full'>
                    <p>اطلاعات کاربر</p>
                </div>
            }
            {selected == "ادمین" && (
                <div className="w-full h-[96vh] pt-[8vh] pb-10 px-5 flex justify-center items-start">
                    <div className="w-full max-w-7xl bg-bg-secondary rounded-2xl border border-text-primary/20 shadow-2xl p-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-text-primary">پنل مدیریت</h1>
                            <p className="text-text-secondary mt-2">افزودن محصول جدید به فروشگاه</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                            <div className="grid xl:grid-cols-4 lg:grid-cols-2 gap-6">

                                <div className="bg-bg-primary rounded-2xl p-6 flex flex-col gap-4">
                                    <h2 className="text-xl font-bold border-r-4 border-accent-secondary pr-3">اطلاعات اصلی</h2>

                                    <input
                                        name="title"
                                        placeholder="نام محصول"
                                        required
                                        className="bg-bg-secondary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition"
                                    />

                                    <input
                                        name="publisher"
                                        placeholder="ناشر"
                                        required
                                        className="bg-bg-secondary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition"
                                    />

                                    <input
                                        name="category"
                                        placeholder="دسته بندی"
                                        required
                                        className="bg-bg-secondary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition"
                                    />

                                    <select
                                        name="dlc"
                                        className="bg-bg-secondary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition"
                                    >
                                        <option value="ندارد">بدون DLC</option>
                                        <option value="دارد">دارای DLC</option>
                                    </select>
                                </div>

                                <div className="bg-bg-primary rounded-2xl p-6 flex flex-col gap-4">
                                    <h2 className="text-xl font-bold border-r-4 border-accent-secondary pr-3">قیمت</h2>

                                    <input
                                        type="number"
                                        name="price"
                                        placeholder="قیمت"
                                        required
                                        className="bg-bg-secondary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition"
                                    />

                                    <input
                                        name="currency"
                                        placeholder="واحد پول"
                                        required
                                        className="bg-bg-secondary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition"
                                    />
                                </div>

                                <div className="bg-bg-primary rounded-2xl p-6 flex flex-col gap-4">
                                    <h2 className="text-xl font-bold border-r-4 border-accent-secondary pr-3">تصاویر</h2>

                                    <label className="bg-bg-secondary rounded-xl border-2 border-dashed border-accent-secondary h-32 flex flex-col justify-center items-center cursor-pointer hover:bg-bg-primary transition">
                                        <span>تصویر محصول</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            name="image"
                                            required
                                            className="hidden"
                                        />
                                    </label>

                                    <label className="bg-bg-secondary rounded-xl border-2 border-dashed border-accent-secondary h-32 flex flex-col justify-center items-center cursor-pointer hover:bg-bg-primary transition">
                                        <span>بنر</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            name="banner"
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="bg-bg-primary rounded-2xl p-6 flex flex-col justify-center items-center gap-5">
                                    <p className="text-center text-text-secondary">
                                        تمام اطلاعات محصول را وارد کنید و سپس روی دکمه افزودن کلیک کنید.
                                    </p>

                                    <button
                                        type="submit"
                                        className="w-full bg-accent-secondary hover:scale-[1.03] hover:brightness-110 transition-all rounded-xl py-4 text-xl font-bold cursor-pointer"
                                    >
                                        افزودن محصول
                                    </button>
                                </div>

                            </div>

                            <div className="bg-bg-primary rounded-2xl p-6">
                                <h2 className="text-xl font-bold border-r-4 border-accent-secondary pr-3 mb-5">توضیحات محصول</h2>

                                <textarea
                                    rows={3}
                                    name="info"
                                    placeholder="توضیحات محصول..."
                                    required
                                    className="w-full bg-bg-secondary rounded-xl p-5 resize-none outline-none border border-transparent focus:border-accent-secondary transition"
                                />
                            </div>

                        </form>
                    </div>
                </div>
            )}
            {selected == "امتیازات" &&
                <div className='md:w-[80vw]  max-md:h-[95vh] flex items-center justify-center h-full'>
                    <p>امتیازات</p>
                </div>
            }
<div className="fixed bottom-0 left-0 w-screen h-[6vh] md:h-[8vh] 
    bg-bgSecondary/60 backdrop-blur-xl 
    border-t border-white/10 
    shadow-[0_-5px_25px_rgba(0,0,0,0.4)]
    flex items-center justify-around z-50">

    {/* سبد خرید */}
    <motion.div
        whileTap={{ scale: 0.9 }}
        onClick={() => setSelected("سبد خرید")}
        className={`relative flex flex-col items-center justify-center w-full h-full cursor-pointer 
            text-[10px] md:text-sm font-bold transition-all duration-200
            ${selected === "سبد خرید" ? "text-white" : "text-textSecondary"}`}
    >
        <motion.div
            animate={{
                scale: selected === "سبد خرید" ? 1.2 : 1,
                color: selected === "سبد خرید" ? "var(--color-accent-secondary)" : "var(--color-text-secondary)"
            }}
            className="text-lg md:text-2xl"
        >
            🛒
        </motion.div>

        <span className={`${selected === "سبد خرید" && "text-accentSecondary drop-shadow-[0_0_6px_var(--color-accent-secondary)]"}`}>
            سبد خرید
        </span>

        {selected === "سبد خرید" && (
            <motion.div
                layoutId="navIndicator"
                className="absolute bottom-0 w-full h-[3px] 
                    bg-gradient-to-r from-accentPrimary to-accentSecondary 
                    shadow-[0_0_10px_var(--color-accent-secondary)]"
            />
        )}
    </motion.div>

    {/* اطلاعات کاربر */}
    <motion.div
        whileTap={{ scale: 0.9 }}
        onClick={() => setSelected("اطلاعات کاربر")}
        className={`relative flex flex-col items-center justify-center w-full h-full cursor-pointer 
            text-[10px] md:text-sm font-bold transition-all duration-200
            ${selected === "اطلاعات کاربر" ? "text-white" : "text-textSecondary"}`}
    >
        <motion.div
            animate={{
                scale: selected === "اطلاعات کاربر" ? 1.2 : 1,
                color: selected === "اطلاعات کاربر" ? "var(--color-accent-secondary)" : "var(--color-text-secondary)"
            }}
            className="text-lg md:text-2xl"
        >
            👤
        </motion.div>

        <span className={`${selected === "اطلاعات کاربر" && "text-accentSecondary drop-shadow-[0_0_6px_var(--color-accent-secondary)]"}`}>
            اطلاعات کاربر
        </span>

        {selected === "اطلاعات کاربر" && (
            <motion.div
                layoutId="navIndicator"
                className="absolute bottom-0 w-full h-[3px] 
                    bg-gradient-to-r from-accentPrimary to-accentSecondary 
                    shadow-[0_0_10px_var(--color-accent-secondary)]"
            />
        )}
    </motion.div>

    {/* امتیازات */}
    <motion.div
        whileTap={{ scale: 0.9 }}
        onClick={() => setSelected("امتیازات")}
        className={`relative flex flex-col items-center justify-center w-full h-full cursor-pointer 
            text-[10px] md:text-sm font-bold transition-all duration-200
            ${selected === "امتیازات" ? "text-white" : "text-textSecondary"}`}
    >
        <motion.div
            animate={{
                scale: selected === "امتیازات" ? 1.2 : 1,
                color: selected === "امتیازات" ? "var(--color-accent-secondary)" : "var(--color-text-secondary)"
            }}
            className="text-lg md:text-2xl"
        >
            ⭐
        </motion.div>

        <span className={`${selected === "امتیازات" && "text-accentSecondary drop-shadow-[0_0_6px_var(--color-accent-secondary)]"}`}>
            امتیازات
        </span>

        {selected === "امتیازات" && (
            <motion.div
                layoutId="navIndicator"
                className="absolute bottom-0 w-full h-[3px] 
                    bg-gradient-to-r from-accentPrimary to-accentSecondary 
                    shadow-[0_0_10px_var(--color-accent-secondary)]"
            />
        )}
    </motion.div>

    {/* ادمین */}
    {user.role === "admin" && (
        <motion.div
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelected("ادمین")}
            className={`relative flex flex-col items-center justify-center w-full h-full cursor-pointer 
                text-[10px] md:text-sm font-bold transition-all duration-200
                ${selected === "ادمین" ? "text-white" : "text-textSecondary"}`}
        >
            <motion.div
                animate={{
                    scale: selected === "ادمین" ? 1.2 : 1,
                    color: selected === "ادمین" ? "var(--color-accent-secondary)" : "var(--color-text-secondary)"
                }}
                className="text-lg md:text-2xl"
            >
                👑
            </motion.div>

            <span className={`${selected === "ادمین" && "text-accentSecondary drop-shadow-[0_0_6px_var(--color-accent-secondary)]"}`}>
                ادمین
            </span>

            {selected === "ادمین" && (
                <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-0 w-full h-[3px] 
                        bg-gradient-to-r from-accentPrimary to-accentSecondary 
                        shadow-[0_0_10px_var(--color-accent-secondary)]"
                />
            )}
        </motion.div>
    )}

    {/* خروج */}
    <motion.div
        whileTap={{ scale: 0.9 }}
        onClick={() => setToken(null)}
        className="flex flex-col items-center justify-center w-full h-full cursor-pointer 
            text-[10px] md:text-sm font-bold text-red-400"
    >
        <div className="text-lg md:text-2xl">🚪</div>
        <span className="mt-1">خروج</span>
    </motion.div>
</div>
        </div>
    );
};

export default Dashboard;