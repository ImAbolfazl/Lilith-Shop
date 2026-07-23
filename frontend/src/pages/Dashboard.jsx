import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { UserContext } from '../App';
import { useNavigate } from 'react-router';
import { motion } from "framer-motion";
import { FaShoppingCart, FaUser, FaStar, FaCrown, FaSignOutAlt, FaTrash } from "react-icons/fa";
import PriceSVG from '../components/PriceSVG';

const Dashboard = () => {
    document.title = "Lilith | Dashboard";
    const [selected, setSelected] = useState("سبد خرید")
    const { token, setToken, user } = useContext(UserContext)
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [ordersLoading, setOrdersLoading] = useState(false)
    const [ordersError, setOrdersError] = useState(null)
    const [profileOverride, setProfileOverride] = useState(null)
    const displayedUser = profileOverride || user
    const [editMode, setEditMode] = useState(false)
    const [editForm, setEditForm] = useState({ firstname: "", lastname: "", email: "", number: "", password: "" })
    const [editLoading, setEditLoading] = useState(false)
    const [editError, setEditError] = useState(null)

    useEffect(() => {
        if (!token) {
            navigate("/")
        }
    }, [token])

    const fetchOrders = async () => {
        setOrdersLoading(true)
        setOrdersError(null)
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
                headers: { authorization: token }
            });

            const rawOrders = res.data.data || [];

            console.log(rawOrders);

            const enriched = await Promise.all(
                rawOrders.map(async (order) => {
                    let info = {};
                    try {
                        info = typeof order.info === "string" ? JSON.parse(order.info) : (order.info || {});
                    } catch {
                        info = {};
                    }

                    let product = null;
                    try {
                        const productRes = await axios.get(
                            `${import.meta.env.VITE_BACKEND_URL}/api/products/product/${order.productId}`
                        );
                        product = productRes.data.data;
                    } catch {
                        product = null;
                    }

                    return { ...order, info, product };
                })
            );

            setOrders(enriched);
        } catch (err) {
            console.error(err);
            setOrdersError("خطا در دریافت سفارش‌ها");
        } finally {
            setOrdersLoading(false)
        }
    };

    const handleDeleteOrder = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
                headers: { authorization: token },
                data: { id }
            });
            setOrders(prev => prev.filter(o => o.id !== id));
        } catch (err) {
            console.error(err);
            alert("حذف سفارش با خطا مواجه شد");
        }
    };

    useEffect(() => {
        if (selected === "سبد خرید" && token) {
            fetchOrders();
        }
    }, [selected, token]);

    const startEdit = () => {
        setEditForm({
            firstname: displayedUser.firstname || "",
            lastname: displayedUser.lastname || "",
            email: displayedUser.email || "",
            number: displayedUser.phone || "",
            password: "",
        });
        setEditError(null);
        setEditMode(true);
    };

    const handleEditChange = (e) => {
        setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditError(null);
        try {
            const res = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/users/`,
                editForm,
                { headers: { authorization: token } }
            );

            if (res.data.status === "success") {
                setProfileOverride(res.data.data);
                setEditMode(false);
            } else {
                setEditError(res.data.data || "خطایی رخ داد");
            }
        } catch (err) {
            console.error(err);
            setEditError(err.response?.data?.data || "ذخیره اطلاعات با خطا مواجه شد");
        } finally {
            setEditLoading(false);
        }
    };

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
                    authorization: token,
                },
            });
            console.log(formData)

            alert("Product uploaded successfully!");
            form.reset()
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        }
    };

    return (
        <div className='flex items-center justify-center h-screen flex-col'>
            {selected == "سبد خرید" &&
                <div className='md:w-[80vw] max-md:h-[95vh] w-full h-full overflow-y-auto pt-28 pb-24 px-5'>
                    <h1 className="text-2xl font-bold mb-6">سبد خرید</h1>

                    {ordersLoading && <p className="text-text-secondary">در حال بارگذاری...</p>}
                    {ordersError && <p className="text-red-400">{ordersError}</p>}
                    {!ordersLoading && !ordersError && orders.length === 0 && (
                        <p className="text-text-secondary">سفارشی یافت نشد</p>
                    )}

                    <div className="flex flex-col gap-4">
                        {orders.map((order) => (
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
                                {order.info?.price && (
                                    <div className="flex items-center gap-2 font-bold">
                                        <span>{order.info?.discount > 0 ? Math.round(order.info?.price * (1 - order.info?.discount / 100)).toLocaleString("fa-IR"): order.info?.price.toLocaleString("fa-IR")}</span>
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
                        ))}
                    </div>
                </div>
            }
            {selected == "اطلاعات کاربر" &&
                <div className='md:w-[80vw] max-md:h-[95vh] w-full h-full flex items-center justify-center'>
                    <div className="bg-bg-secondary rounded-2xl p-8 w-full max-w-md flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-2xl font-bold">اطلاعات کاربر</h1>
                            {!editMode && (
                                <button
                                    onClick={startEdit}
                                    className="text-sm text-accent-secondary underline hover:text-accent-primary transition"
                                >
                                    ویرایش اطلاعات
                                </button>
                            )}
                        </div>

                        {!editMode ? (
                            <>
                                <div className="flex justify-between border-b border-text-primary/10 pb-2">
                                    <span className="text-text-secondary">نام</span>
                                    <span>{displayedUser.firstname}</span>
                                </div>
                                <div className="flex justify-between border-b border-text-primary/10 pb-2">
                                    <span className="text-text-secondary">نام خانوادگی</span>
                                    <span>{displayedUser.lastname}</span>
                                </div>
                                <div className="flex justify-between border-b border-text-primary/10 pb-2">
                                    <span className="text-text-secondary">شماره تماس</span>
                                    <span dir="ltr">{displayedUser.phone}</span>
                                </div>
                                {displayedUser.email && (
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary">ایمیل</span>
                                        <span dir="ltr">{displayedUser.email}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm text-text-secondary">نام</label>
                                    <input
                                        name="firstname"
                                        value={editForm.firstname}
                                        onChange={handleEditChange}
                                        required
                                        className="bg-bg-primary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm text-text-secondary">نام خانوادگی</label>
                                    <input
                                        name="lastname"
                                        value={editForm.lastname}
                                        onChange={handleEditChange}
                                        required
                                        className="bg-bg-primary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm text-text-secondary">ایمیل</label>
                                    <input
                                        name="email"
                                        type="email"
                                        dir="ltr"
                                        value={editForm.email}
                                        onChange={handleEditChange}
                                        className="bg-bg-primary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm text-text-secondary">شماره تماس</label>
                                    <input
                                        name="number"
                                        dir="ltr"
                                        value={editForm.number}
                                        onChange={handleEditChange}
                                        required
                                        placeholder="09123456789"
                                        className="bg-bg-primary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm text-text-secondary">رمز عبور</label>
                                    <input
                                        name="password"
                                        type="password"
                                        dir="ltr"
                                        value={editForm.password}
                                        onChange={handleEditChange}
                                        required
                                        placeholder="بین ۶ تا ۱۲ کاراکتر"
                                        className="bg-bg-primary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition"
                                    />
                                    <span className="text-xs text-text-secondary">برای ذخیره تغییرات، رمز عبور را وارد کنید</span>
                                </div>

                                {editError && <p className="text-red-400 text-sm">{editError}</p>}

                                <div className="flex gap-3 mt-2">
                                    <button
                                        type="submit"
                                        disabled={editLoading}
                                        className={`flex-1 bg-accent-secondary rounded-xl py-3 font-bold transition ${editLoading ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"}`}
                                    >
                                        {editLoading ? "در حال ذخیره..." : "ذخیره"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditMode(false)}
                                        className="flex-1 bg-bg-primary rounded-xl py-3 font-bold hover:brightness-110 transition"
                                    >
                                        انصراف
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
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
                                    <input name="title" placeholder="نام محصول" required
                                           className="bg-bg-secondary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition" />
                                    <input name="publisher" placeholder="ناشر" required
                                           className="bg-bg-secondary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition" />
                                    <input name="category" placeholder="دسته بندی" required
                                           className="bg-bg-secondary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition" />
                                    <select name="dlc"
                                            className="bg-bg-secondary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition">
                                        <option value="ندارد">بدون DLC</option>
                                        <option value="دارد">دارای DLC</option>
                                    </select>
                                </div>

                                <div className="bg-bg-primary rounded-2xl p-6 flex flex-col gap-4">
                                    <h2 className="text-xl font-bold border-r-4 border-accent-secondary pr-3">قیمت</h2>
                                    <input type="number" name="price" placeholder="قیمت" required
                                           className="bg-bg-secondary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition" />
                                    <input name="currency" placeholder="واحد پول" required
                                           className="bg-bg-secondary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition" />
                                </div>

                                <div className="bg-bg-primary rounded-2xl p-6 flex flex-col gap-4">
                                    <h2 className="text-xl font-bold border-r-4 border-accent-secondary pr-3">تصاویر</h2>
                                    <label className="bg-bg-secondary rounded-xl border-2 border-dashed border-accent-secondary h-32 flex flex-col justify-center items-center cursor-pointer hover:bg-bg-primary transition">
                                        <span>تصویر محصول</span>
                                        <input type="file" accept="image/*" name="image" required className="hidden" />
                                    </label>
                                    <label className="bg-bg-secondary rounded-xl border-2 border-dashed border-accent-secondary h-32 flex flex-col justify-center items-center cursor-pointer hover:bg-bg-primary transition">
                                        <span>بنر</span>
                                        <input type="file" accept="image/*" name="banner" className="hidden" />
                                    </label>
                                </div>

                                <div className="bg-bg-primary rounded-2xl p-6 flex flex-col justify-center items-center gap-5">
                                    <p className="text-center text-text-secondary">
                                        تمام اطلاعات محصول را وارد کنید و سپس روی دکمه افزودن کلیک کنید.
                                    </p>
                                    <button type="submit"
                                            className="w-full bg-accent-secondary hover:scale-[1.03] hover:brightness-110 transition-all rounded-xl py-4 text-xl font-bold cursor-pointer">
                                        افزودن محصول
                                    </button>
                                </div>
                            </div>

                            <div className="bg-bg-primary rounded-2xl p-6">
                                <h2 className="text-xl font-bold border-r-4 border-accent-secondary pr-3 mb-5">توضیحات محصول</h2>
                                <textarea rows={3} name="info" placeholder="توضیحات محصول..." required
                                          className="w-full bg-bg-secondary rounded-xl p-5 resize-none outline-none border border-transparent focus:border-accent-secondary transition" />
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {selected == "امتیازات" &&
                <div className='md:w-[80vw] max-md:h-[95vh] flex items-center justify-center h-full flex-col gap-2'>
                    <p className="text-xl font-bold">امتیازات</p>
                </div>
            }

            <div className="fixed bottom-0 left-0 w-screen h-[6vh] md:h-[8vh]
                bg-bgSecondary/60 backdrop-blur-xl
                border-t border-white/10
                shadow-[0_-5px_25px_rgba(0,0,0,0.4)]
                flex items-center justify-around z-50">

                <motion.div whileTap={{ scale: 0.9 }} onClick={() => setSelected("سبد خرید")}
                            className={`relative flex flex-col items-center justify-center w-full h-full cursor-pointer
                        text-[10px] md:text-sm font-bold transition-all duration-200
                        ${selected === "سبد خرید" ? "text-white" : "text-textSecondary"}`}>
                    <motion.div animate={{
                        scale: selected === "سبد خرید" ? 1.2 : 1,
                        color: selected === "سبد خرید" ? "var(--color-accent-secondary)" : "var(--color-text-secondary)"
                    }} className="text-lg md:text-2xl">
                        <FaShoppingCart />
                    </motion.div>
                    <span className={`${selected === "سبد خرید" && "text-accentSecondary drop-shadow-[0_0_6px_var(--color-accent-secondary)]"}`}>
                        سبد خرید
                    </span>
                    {selected === "سبد خرید" && (
                        <motion.div layoutId="navIndicator" className="absolute bottom-0 w-full h-[3px]
                            bg-gradient-to-r from-accentPrimary to-accentSecondary
                            shadow-[0_0_10px_var(--color-accent-secondary)]" />
                    )}
                </motion.div>

                <motion.div whileTap={{ scale: 0.9 }} onClick={() => setSelected("اطلاعات کاربر")}
                            className={`relative flex flex-col items-center justify-center w-full h-full cursor-pointer
                        text-[10px] md:text-sm font-bold transition-all duration-200
                        ${selected === "اطلاعات کاربر" ? "text-white" : "text-textSecondary"}`}>
                    <motion.div animate={{
                        scale: selected === "اطلاعات کاربر" ? 1.2 : 1,
                        color: selected === "اطلاعات کاربر" ? "var(--color-accent-secondary)" : "var(--color-text-secondary)"
                    }} className="text-lg md:text-xl">
                        <FaUser />
                    </motion.div>
                    <span className={`${selected === "اطلاعات کاربر" && "text-accentSecondary drop-shadow-[0_0_6px_var(--color-accent-secondary)]"}`}>
                        اطلاعات کاربر
                    </span>
                    {selected === "اطلاعات کاربر" && (
                        <motion.div layoutId="navIndicator" className="absolute bottom-0 w-full h-[3px]
                            bg-gradient-to-r from-accentPrimary to-accentSecondary
                            shadow-[0_0_10px_var(--color-accent-secondary)]" />
                    )}
                </motion.div>

                <motion.div whileTap={{ scale: 0.9 }} onClick={() => setSelected("امتیازات")}
                            className={`relative flex flex-col items-center justify-center w-full h-full cursor-pointer
                        text-[10px] md:text-sm font-bold transition-all duration-200
                        ${selected === "امتیازات" ? "text-white" : "text-textSecondary"}`}>
                    <motion.div animate={{
                        scale: selected === "امتیازات" ? 1.2 : 1,
                        color: selected === "امتیازات" ? "var(--color-accent-secondary)" : "var(--color-text-secondary)"
                    }} className="text-lg md:text-xl">
                        <FaStar />
                    </motion.div>
                    <span className={`${selected === "امتیازات" && "text-accentSecondary drop-shadow-[0_0_6px_var(--color-accent-secondary)]"}`}>
                        امتیازات
                    </span>
                    {selected === "امتیازات" && (
                        <motion.div layoutId="navIndicator" className="absolute bottom-0 w-full h-[3px]
                            bg-gradient-to-r from-accentPrimary to-accentSecondary
                            shadow-[0_0_10px_var(--color-accent-secondary)]" />
                    )}
                </motion.div>

                {user.role === "admin" && (
                    <motion.div whileTap={{ scale: 0.9 }} onClick={() => setSelected("ادمین")}
                                className={`relative flex flex-col items-center justify-center w-full h-full cursor-pointer
                            text-[10px] md:text-sm font-bold transition-all duration-200
                            ${selected === "ادمین" ? "text-white" : "text-textSecondary"}`}>
                        <motion.div animate={{
                            scale: selected === "ادمین" ? 1.2 : 1,
                            color: selected === "ادمین" ? "var(--color-accent-secondary)" : "var(--color-text-secondary)"
                        }} className="text-lg md:text-xl">
                            <FaCrown />
                        </motion.div>
                        <span className={`${selected === "ادمین" && "text-accentSecondary drop-shadow-[0_0_6px_var(--color-accent-secondary)]"}`}>
                            ادمین
                        </span>
                        {selected === "ادمین" && (
                            <motion.div layoutId="navIndicator" className="absolute bottom-0 w-full h-[3px]
                                bg-gradient-to-r from-accentPrimary to-accentSecondary
                                shadow-[0_0_10px_var(--color-accent-secondary)]" />
                        )}
                    </motion.div>
                )}

                <motion.div whileTap={{ scale: 0.9 }} onClick={() => setToken(null)}
                            className="flex flex-col items-center justify-center w-full h-full cursor-pointer
                        text-[10px] md:text-sm font-bold text-red-400">
                    <div className="text-lg md:text-xl"><FaSignOutAlt /></div>
                    <span className="mt-1">خروج</span>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;