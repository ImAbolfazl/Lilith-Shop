import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { UserContext } from '../App';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingCart, FaUser, FaStar, FaCrown, FaSignOutAlt } from "react-icons/fa";
import OrderCard from '../components/OrderCard';
import PriceSVG from '../components/PriceSVG.jsx';

const infoFieldLabels = {
    region: "ریجن",
    name: "نسخه / آیتم",
    username: "نام کاربری",
    password: "رمز عبور",
    steamGuard: "کد استیم گارد",
    price: "قیمت",
    discount: "تخفیف",
    realDiscount: "تخفیف واقعی"
}

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
    const ORDERS_PAGE_SIZE = 5
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalOrders, setTotalOrders] = useState(0)
    const [createPriceForm, setCreatePriceForm] = useState({
        initialPrice: 0,
        regions: [{ name: "", items: [{ tag: "US", name: "", price: 0 }] }]
    })

    const [adminView, setAdminView] = useState("افزودن محصول")

    const [allUsers, setAllUsers] = useState([])
    const [usersLoading, setUsersLoading] = useState(false)
    const [usersError, setUsersError] = useState(null)
    const [usersPage, setUsersPage] = useState(1)
    const [usersTotalPages, setUsersTotalPages] = useState(1)

    const [allOrders, setAllOrders] = useState([])
    const [allOrdersLoading, setAllOrdersLoading] = useState(false)
    const [allOrdersError, setAllOrdersError] = useState(null)
    const [allOrdersPage, setAllOrdersPage] = useState(1)
    const [allOrdersTotalPages, setAllOrdersTotalPages] = useState(1)
    const [selectedOrder, setSelectedOrder] = useState(null)

    useEffect(() => {
        if (!token) {
            navigate("/")
        }
    }, [token])

    const fetchOrders = async (page = currentPage) => {
        setOrdersLoading(true)
        setOrdersError(null)
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
                headers: { authorization: token },
                params: { page, limit: ORDERS_PAGE_SIZE }
            });

            const payload = res.data;
            const rawOrders = Array.isArray(payload?.data)
                ? payload.data
                : Array.isArray(payload?.orders)
                    ? payload.orders
                    : Array.isArray(payload)
                        ? payload
                        : [];

            const pagination = payload?.pagination || payload?.meta || {};
            const resolvedPage = Number(pagination.page ?? payload?.page ?? page ?? 1) || 1;
            const totalCount = Number(
                pagination.totalItems ?? pagination.total ?? payload?.totalItems ?? payload?.total ?? rawOrders.length
            ) || rawOrders.length;
            const resolvedTotalPages = Number(
                pagination.totalPages ?? payload?.totalPages ?? payload?.pages ?? (totalCount > 0 ? Math.ceil(totalCount / ORDERS_PAGE_SIZE) : 1)
            ) || 1;

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
            setCurrentPage(resolvedPage);
            setTotalPages(resolvedTotalPages);
            setTotalOrders(totalCount);
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
            fetchOrders(currentPage);
        } catch (err) {
            console.error(err);
            alert("حذف سفارش با خطا مواجه شد");
        }
    };

    useEffect(() => {
        if (selected === "سبد خرید" && token) {
            fetchOrders(currentPage);
        }
    }, [selected, token, currentPage]);

    const fetchAllUsers = async (page = usersPage) => {
        setUsersLoading(true)
        setUsersError(null)
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/all`, {
                headers: { authorization: token },
                params: { page, limit: 20 }
            });

            setAllUsers(res.data.data || []);
            setUsersPage(res.data.pagination?.page || page);
            setUsersTotalPages(res.data.pagination?.totalPages || 1);
        } catch (err) {
            console.error(err);
            setUsersError("خطا در دریافت کاربران");
        } finally {
            setUsersLoading(false)
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm("آیا از حذف این کاربر مطمئن هستید؟")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/users/${id}`, {
                headers: { authorization: token }
            });
            setAllUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.data || "حذف کاربر با خطا مواجه شد");
        }
    };

    useEffect(() => {
        if (selected === "ادمین" && adminView === "کاربران" && token) {
            fetchAllUsers(usersPage);
        }
    }, [selected, adminView, usersPage, token]);

    const fetchAllOrders = async (page = allOrdersPage) => {
        setAllOrdersLoading(true)
        setAllOrdersError(null)
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/all`, {
                headers: { authorization: token },
                params: { page, limit: 20 }
            });

            setAllOrders(res.data.data || []);
            setAllOrdersPage(res.data.pagination?.page || page);
            setAllOrdersTotalPages(res.data.pagination?.totalPages || 1);
        } catch (err) {
            console.error(err);
            setAllOrdersError("خطا در دریافت سفارش‌ها");
        } finally {
            setAllOrdersLoading(false)
        }
    };

    useEffect(() => {
        if (selected === "ادمین" && adminView === "سفارش‌ها" && token) {
            fetchAllOrders(allOrdersPage);
        }
    }, [selected, adminView, allOrdersPage, token]);

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

    const updateCreateRegionName = (regionIndex, value) => {
        const regions = [...createPriceForm.regions]
        regions[regionIndex] = {...regions[regionIndex], name: value}
        setCreatePriceForm({...createPriceForm, regions})
    }

    const updateCreateItemField = (regionIndex, itemIndex, field, value) => {
        const regions = [...createPriceForm.regions]
        const items = [...regions[regionIndex].items]
        items[itemIndex] = {...items[itemIndex], [field]: field === "price" ? Number(value) : value}
        regions[regionIndex] = {...regions[regionIndex], items}
        setCreatePriceForm({...createPriceForm, regions})
    }

    const addCreateRegion = () => {
        setCreatePriceForm({
            ...createPriceForm,
            regions: [...createPriceForm.regions, {name: "", items: [{tag: "US", name: "", price: 0}]}]
        })
    }

    const removeCreateRegion = (regionIndex) => {
        setCreatePriceForm({
            ...createPriceForm,
            regions: createPriceForm.regions.filter((_, i) => i !== regionIndex)
        })
    }

    const addCreateItem = (regionIndex) => {
        const regions = [...createPriceForm.regions]
        regions[regionIndex] = {
            ...regions[regionIndex],
            items: [...regions[regionIndex].items, {tag: "US", name: "", price: 0}]
        }
        setCreatePriceForm({...createPriceForm, regions})
    }

    const removeCreateItem = (regionIndex, itemIndex) => {
        const regions = [...createPriceForm.regions]
        regions[regionIndex] = {
            ...regions[regionIndex],
            items: regions[regionIndex].items.filter((_, i) => i !== itemIndex)
        }
        setCreatePriceForm({...createPriceForm, regions})
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData();
        formData.append('title', form.title.value);
        formData.append('category', form.category.value);
        formData.append('publisher', form.publisher.value);
        formData.append('dlc', form.dlc.value);
        formData.append('info', form.info.value);

        const subs = {}
        createPriceForm.regions.forEach((r) => {
            subs[r.name] = r.items
        })

        const priceObject = {
            subs,
            initial: Number(createPriceForm.initialPrice),
            initialTag: createPriceForm.regions[0]?.items[0]?.tag || ""
        }

        formData.append('price', JSON.stringify(priceObject));

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

            alert("Product uploaded successfully!");
            form.reset()
            setCreatePriceForm({
                initialPrice: 0,
                regions: [{ name: "", items: [{ tag: "US", name: "", price: 0 }] }]
            })
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        }
    };

    if(!user){
        return <div className="flex items-center justify-center h-screen">
            درحال بارگذاری اطلاعات...
        </div>
    }

    if(user){
        return <div className='flex items-center justify-center h-screen flex-col md:pr-24 lg:pr-28'>
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
                            <OrderCard key={order.id} order={order}/>
                        ))}
                    </div>

                    {!ordersLoading && !ordersError && totalPages > 1 && (
                        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm text-text-secondary">
                                مجموع: {totalOrders} سفارش
                            </p>

                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-xl bg-bg-primary px-3 py-2 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    قبلی
                                </button>

                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`min-w-10 rounded-xl px-3 py-2 text-sm font-bold transition ${page === currentPage ? "bg-accent-secondary text-white" : "bg-bg-primary text-text-secondary"}`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-xl bg-bg-primary px-3 py-2 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    بعدی
                                </button>
                            </div>
                        </div>
                    )}
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
                        <div className="mb-8 flex flex-col gap-5">
                            <div>
                                <h1 className="text-3xl font-bold text-text-primary">پنل مدیریت</h1>
                                <p className="text-text-secondary mt-2">مدیریت محصولات، کاربران و سفارش‌ها</p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {["افزودن محصول", "کاربران", "سفارش‌ها"].map((view) => (
                                    <button
                                        key={view}
                                        onClick={() => setAdminView(view)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition ${adminView === view ? "bg-accent-secondary text-white" : "bg-bg-primary text-text-secondary hover:text-text-primary"}`}
                                    >
                                        {view}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {adminView === "افزودن محصول" && (
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
                                    <input
                                        type="number"
                                        placeholder="قیمت پایه (initial)"
                                        value={createPriceForm.initialPrice}
                                        onChange={(e) => setCreatePriceForm({...createPriceForm, initialPrice: e.target.value})}
                                        className="bg-bg-secondary rounded-xl p-3 outline-none border border-transparent focus:border-accent-secondary transition"
                                    />

                                    <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                                        {createPriceForm.regions.map((regionItem, regionIndex) => (
                                            <div key={regionIndex} className="bg-bg-secondary rounded-xl p-3 flex flex-col gap-2 border border-white/5">
                                                <div className="flex justify-between items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={regionItem.name}
                                                        onChange={(e) => updateCreateRegionName(regionIndex, e.target.value)}
                                                        placeholder="نام ریجن"
                                                        className="bg-bg-primary rounded-lg px-3 py-2 outline-none flex-1 border border-transparent focus:border-accent-secondary"
                                                    />
                                                    <p onClick={() => removeCreateRegion(regionIndex)} className="text-red-400 cursor-pointer text-xs hover:text-red-300 shrink-0">حذف ریجن</p>
                                                </div>

                                                {regionItem.items.map((item, itemIndex) => (
                                                    <div key={itemIndex} className="grid grid-cols-4 gap-2 items-center">
                                                        <input
                                                            type="text"
                                                            value={item.tag}
                                                            onChange={(e) => updateCreateItemField(regionIndex, itemIndex, "tag", e.target.value)}
                                                            placeholder="کد کشور"
                                                            className="bg-bg-primary rounded-lg px-2 py-2 outline-none border border-transparent focus:border-accent-secondary text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) => updateCreateItemField(regionIndex, itemIndex, "name", e.target.value)}
                                                            placeholder="نام"
                                                            className="bg-bg-primary rounded-lg px-2 py-2 outline-none border border-transparent focus:border-accent-secondary text-sm"
                                                        />
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => updateCreateItemField(regionIndex, itemIndex, "price", e.target.value)}
                                                            placeholder="قیمت"
                                                            className="bg-bg-primary rounded-lg px-2 py-2 outline-none border border-transparent focus:border-accent-secondary text-sm"
                                                        />
                                                        <p onClick={() => removeCreateItem(regionIndex, itemIndex)} className="text-red-400 cursor-pointer text-xs text-center hover:text-red-300">حذف</p>
                                                    </div>
                                                ))}

                                                <p onClick={() => addCreateItem(regionIndex)} className="text-accent-secondary text-xs cursor-pointer w-fit hover:brightness-110">+ افزودن آیتم</p>
                                            </div>
                                        ))}
                                    </div>

                                    <p onClick={addCreateRegion} className="text-accent-secondary text-sm cursor-pointer w-fit hover:brightness-110">+ افزودن ریجن</p>
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
                        )}

                        {adminView === "کاربران" && (
                            <div className="flex flex-col gap-4">
                                {usersLoading && <p className="text-text-secondary">در حال بارگذاری...</p>}
                                {usersError && <p className="text-red-400">{usersError}</p>}
                                {!usersLoading && !usersError && allUsers.length === 0 && (
                                    <p className="text-text-secondary">کاربری یافت نشد</p>
                                )}

                                <div className="flex flex-col gap-3">
                                    {allUsers.map((u) => (
                                        <div key={u.id} className="bg-bg-primary rounded-2xl p-4 flex items-center justify-between gap-4 border border-white/5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold">{u.firstname} {u.lastname}</p>
                                                    {u.role === "admin" && (
                                                        <span className="text-xs bg-accent-secondary/20 text-accent-secondary px-2 py-0.5 rounded-lg">ادمین</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-text-secondary" dir="ltr">{u.phone}</p>
                                                {u.email && <p className="text-xs text-text-secondary" dir="ltr">{u.email}</p>}
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <p className="text-sm text-text-secondary">امتیاز: {u.score}</p>
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    disabled={u.id === user.id}
                                                    className="text-red-400 hover:text-red-300 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {!usersLoading && !usersError && usersTotalPages > 1 && (
                                    <div className="flex items-center gap-2 flex-wrap justify-center mt-2">
                                        <button
                                            onClick={() => setUsersPage(prev => Math.max(1, prev - 1))}
                                            disabled={usersPage === 1}
                                            className="rounded-xl bg-bg-primary px-3 py-2 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            قبلی
                                        </button>

                                        {Array.from({ length: usersTotalPages }, (_, index) => index + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setUsersPage(page)}
                                                className={`min-w-10 rounded-xl px-3 py-2 text-sm font-bold transition ${page === usersPage ? "bg-accent-secondary text-white" : "bg-bg-primary text-text-secondary"}`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setUsersPage(prev => Math.min(usersTotalPages, prev + 1))}
                                            disabled={usersPage === usersTotalPages}
                                            className="rounded-xl bg-bg-primary px-3 py-2 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            بعدی
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {adminView === "سفارش‌ها" && (
                            <div className="flex flex-col gap-4">
                                {allOrdersLoading && <p className="text-text-secondary">در حال بارگذاری...</p>}
                                {allOrdersError && <p className="text-red-400">{allOrdersError}</p>}
                                {!allOrdersLoading && !allOrdersError && allOrders.length === 0 && (
                                    <p className="text-text-secondary">سفارشی یافت نشد</p>
                                )}

                                <div className="flex flex-col gap-3">
                                    {allOrders.map((order) => (
                                        <div key={order.id} onClick={() => setSelectedOrder(order)} className="bg-bg-primary rounded-2xl p-4 flex flex-col gap-2 border border-white/5 cursor-pointer hover:border-accent-secondary/40 transition">
                                            <div className="flex justify-between items-center flex-wrap gap-2">
                                                <p className="font-bold">{order.product?.title || "محصول حذف شده"}</p>
                                                <p className="text-xs text-text-secondary">
                                                    {order.created_at ? new Date(order.created_at).toLocaleString("fa-IR") : ""}
                                                </p>
                                            </div>

                                            <div className="flex justify-between items-center flex-wrap gap-2 text-sm text-text-secondary">
                                                <p>{order.user ? `${order.user.firstname} ${order.user.lastname}` : "کاربر نامشخص"}</p>
                                                <p dir="ltr">{order.user?.phone}</p>
                                            </div>

                                            <div className="flex justify-between items-center flex-wrap gap-2 text-sm">
                                                <p className="text-text-secondary">{order.info?.region}</p>
                                                {typeof order.info?.price === "number" && (
                                                    <p className="flex items-center gap-2">{order.info.price.toLocaleString("fa-IR")} <PriceSVG/></p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {!allOrdersLoading && !allOrdersError && allOrdersTotalPages > 1 && (
                                    <div className="flex items-center gap-2 flex-wrap justify-center mt-2">
                                        <button
                                            onClick={() => setAllOrdersPage(prev => Math.max(1, prev - 1))}
                                            disabled={allOrdersPage === 1}
                                            className="rounded-xl bg-bg-primary px-3 py-2 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            قبلی
                                        </button>

                                        {Array.from({ length: allOrdersTotalPages }, (_, index) => index + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setAllOrdersPage(page)}
                                                className={`min-w-10 rounded-xl px-3 py-2 text-sm font-bold transition ${page === allOrdersPage ? "bg-accent-secondary text-white" : "bg-bg-primary text-text-secondary"}`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setAllOrdersPage(prev => Math.min(allOrdersTotalPages, prev + 1))}
                                            disabled={allOrdersPage === allOrdersTotalPages}
                                            className="rounded-xl bg-bg-primary px-3 py-2 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            بعدی
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {selected == "امتیازات" &&
                <div className='md:w-[80vw] max-md:h-[95vh] flex items-center justify-center h-full flex-col gap-2'>
                    <p className="text-xl font-bold">امتیازات</p>
                </div>
            }

            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-5"
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.98 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-bg-secondary rounded-2xl p-6 w-full max-w-md flex flex-col gap-3 max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-bold">جزئیات سفارش #{selectedOrder.id}</h2>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-text-secondary hover:text-text-primary text-sm"
                                >
                                    بستن
                                </button>
                            </div>

                            <div className="flex justify-between border-b border-text-primary/10 pb-2">
                                <span className="text-text-secondary">محصول</span>
                                <span>{selectedOrder.product?.title || "محصول حذف شده"}</span>
                            </div>

                            <div className="flex justify-between border-b border-text-primary/10 pb-2">
                                <span className="text-text-secondary">کاربر</span>
                                <span>{selectedOrder.user ? `${selectedOrder.user.firstname} ${selectedOrder.user.lastname}` : "کاربر نامشخص"}</span>
                            </div>

                            <div className="flex justify-between border-b border-text-primary/10 pb-2">
                                <span className="text-text-secondary">شماره تماس</span>
                                <span dir="ltr">{selectedOrder.user?.phone}</span>
                            </div>

                            {Object.entries(selectedOrder.info || {}).map(([key, value]) => {
                                if (value === null || value === undefined || value === "") return null;

                                if (key === "price" && typeof value === "number") {
                                    return (
                                        <div key={key} className="flex justify-between border-b border-text-primary/10 pb-2">
                                            <span className="text-text-secondary">{infoFieldLabels[key] || key}</span>
                                            <span className="flex items-center gap-2">{value.toLocaleString("fa-IR")} <PriceSVG/></span>
                                        </div>
                                    );
                                }

                                if (key === "discount" && typeof value === "object") {
                                    const percent = value.percent || 0;
                                    return (
                                        <div key={key} className="flex justify-between border-b border-text-primary/10 pb-2">
                                            <span className="text-text-secondary">{infoFieldLabels[key] || key}</span>
                                            <span dir="ltr">
                                                {percent > 0
                                                    ? `${percent}%${value.expires ? " تا " + new Date(value.expires).toLocaleDateString("fa-IR") : ""}`
                                                    : "ندارد"}
                                            </span>
                                        </div>
                                    );
                                }

                                if (typeof value === "object") return null;

                                return (
                                    <div key={key} className="flex justify-between border-b border-text-primary/10 pb-2">
                                        <span className="text-text-secondary">{infoFieldLabels[key] || key}</span>
                                        <span dir="ltr">{String(value)}</span>
                                    </div>
                                );
                            })}

                            <div className="flex justify-between border-b border-text-primary/10 pb-2">
                                <span className="text-text-secondary">تعداد</span>
                                <span>{selectedOrder.quantity}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-text-secondary">تاریخ ثبت</span>
                                <span className="text-xs">{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString("fa-IR") : ""}</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="hidden md:flex md:flex-col fixed top-0 right-0 h-screen w-24 lg:w-28
                bg-bgSecondary/60 backdrop-blur-xl
                border-l border-white/10
                shadow-[-5px_0_25px_rgba(0,0,0,0.4)]
                items-center justify-center gap-10 z-50 py-10">

                <motion.div whileTap={{ scale: 0.95 }} onClick={() => setSelected("سبد خرید")}
                            className={`relative flex flex-col items-center justify-center gap-1.5 cursor-pointer w-full py-2
                        text-xs font-bold transition-all duration-200
                        ${selected === "سبد خرید" ? "text-white" : "text-textSecondary"}`}>
                    <motion.div animate={{
                        scale: selected === "سبد خرید" ? 1.2 : 1,
                        color: selected === "سبد خرید" ? "var(--color-accent-secondary)" : "var(--color-text-secondary)"
                    }} className="text-2xl">
                        <FaShoppingCart />
                    </motion.div>
                    <span className={`${selected === "سبد خرید" && "text-accentSecondary drop-shadow-[0_0_6px_var(--color-accent-secondary)]"}`}>
                        سبد خرید
                    </span>
                    {selected === "سبد خرید" && (
                        <motion.div layoutId="navIndicatorDesktop" className="absolute right-0 top-0 h-full w-[3px]
                            bg-gradient-to-b from-accentPrimary to-accentSecondary
                            shadow-[0_0_10px_var(--color-accent-secondary)]" />
                    )}
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }} onClick={() => setSelected("اطلاعات کاربر")}
                            className={`relative flex flex-col items-center justify-center gap-1.5 cursor-pointer w-full py-2
                        text-xs font-bold transition-all duration-200
                        ${selected === "اطلاعات کاربر" ? "text-white" : "text-textSecondary"}`}>
                    <motion.div animate={{
                        scale: selected === "اطلاعات کاربر" ? 1.2 : 1,
                        color: selected === "اطلاعات کاربر" ? "var(--color-accent-secondary)" : "var(--color-text-secondary)"
                    }} className="text-xl">
                        <FaUser />
                    </motion.div>
                    <span className={`${selected === "اطلاعات کاربر" && "text-accentSecondary drop-shadow-[0_0_6px_var(--color-accent-secondary)]"}`}>
                        اطلاعات کاربر
                    </span>
                    {selected === "اطلاعات کاربر" && (
                        <motion.div layoutId="navIndicatorDesktop" className="absolute right-0 top-0 h-full w-[3px]
                            bg-gradient-to-b from-accentPrimary to-accentSecondary
                            shadow-[0_0_10px_var(--color-accent-secondary)]" />
                    )}
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }} onClick={() => setSelected("امتیازات")}
                            className={`relative flex flex-col items-center justify-center gap-1.5 cursor-pointer w-full py-2
                        text-xs font-bold transition-all duration-200
                        ${selected === "امتیازات" ? "text-white" : "text-textSecondary"}`}>
                    <motion.div animate={{
                        scale: selected === "امتیازات" ? 1.2 : 1,
                        color: selected === "امتیازات" ? "var(--color-accent-secondary)" : "var(--color-text-secondary)"
                    }} className="text-xl">
                        <FaStar />
                    </motion.div>
                    <span className={`${selected === "امتیازات" && "text-accentSecondary drop-shadow-[0_0_6px_var(--color-accent-secondary)]"}`}>
                        امتیازات
                    </span>
                    {selected === "امتیازات" && (
                        <motion.div layoutId="navIndicatorDesktop" className="absolute right-0 top-0 h-full w-[3px]
                            bg-gradient-to-b from-accentPrimary to-accentSecondary
                            shadow-[0_0_10px_var(--color-accent-secondary)]" />
                    )}
                </motion.div>

                {user.role === "admin" && (
                    <motion.div whileTap={{ scale: 0.95 }} onClick={() => setSelected("ادمین")}
                                className={`relative flex flex-col items-center justify-center gap-1.5 cursor-pointer w-full py-2
                            text-xs font-bold transition-all duration-200
                            ${selected === "ادمین" ? "text-white" : "text-textSecondary"}`}>
                        <motion.div animate={{
                            scale: selected === "ادمین" ? 1.2 : 1,
                            color: selected === "ادمین" ? "var(--color-accent-secondary)" : "var(--color-text-secondary)"
                        }} className="text-xl">
                            <FaCrown />
                        </motion.div>
                        <span className={`${selected === "ادمین" && "text-accentSecondary drop-shadow-[0_0_6px_var(--color-accent-secondary)]"}`}>
                            ادمین
                        </span>
                        {selected === "ادمین" && (
                            <motion.div layoutId="navIndicatorDesktop" className="absolute right-0 top-0 h-full w-[3px]
                                bg-gradient-to-b from-accentPrimary to-accentSecondary
                                shadow-[0_0_10px_var(--color-accent-secondary)]" />
                        )}
                    </motion.div>
                )}

                <motion.div whileTap={{ scale: 0.95 }} onClick={() => setToken(null)}
                            className="flex flex-col items-center justify-center gap-1.5 w-full py-2 cursor-pointer
                        text-xs font-bold text-red-400">
                    <div className="text-xl"><FaSignOutAlt /></div>
                    <span>خروج</span>
                </motion.div>
            </div>

            <div className="md:hidden fixed bottom-0 left-0 w-screen h-[6vh] md:h-[8vh]
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
    }
};

export default Dashboard;