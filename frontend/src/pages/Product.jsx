import React, {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate, useParams} from "react-router";
import axios from "axios";
import {motion, AnimatePresence} from "framer-motion";
import PriceSVG from "../components/PriceSVG.jsx";
import { FaMicrochip, FaCircleInfo } from "react-icons/fa6";
import { useContext } from 'react';
import { UserContext } from '../App.jsx';
import { IoIosArrowBack } from "react-icons/io";
import toast from "react-hot-toast";
import { IoMdAdd } from "react-icons/io";

const Product = () => {
    const [loading, setLoading] = useState(true)
    const [region, setRegion] = useState()
    const [data, setData] = useState(null)
    const [panel, setPanel] = useState()
    const [orderBody, setOrderBody] = useState({})
    const [editForm, setEditForm] = useState(null)
    const id = useParams().id
    const { pathname } = useLocation();
    const [discount, setDiscount] = useState()
    const [discountTimeLeft, setDiscountTimeLeft] = useState()
    const {token, user} = useContext(UserContext)
    const navigate = useNavigate()

    const passwordRequiredCategories = [
        "Steam",
        "Discord"
    ]

    const getDiscountTimeLeft = () => {
        if (!data?.discount) return ""

        const discountData = JSON.parse(data.discount)

        if (!discountData.expires) return ""

        const diff = new Date(discountData.expires) - new Date()

        if (diff <= 0) return ""

        const seconds = Math.floor(diff / 1000)

        const days = Math.floor(seconds / 86400)
        const hours = Math.floor((seconds % 86400) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        if(days > 0){
            return `${days} روز ${hours} ساعت`
        }

        if(hours > 0){
            return `${hours} ساعت ${minutes} دقیقه`
        }

        if(minutes > 0){
            return `${minutes} دقیقه`
        }

        return "به زودی تمام می‌شود"
    }

    useEffect(() => {
        if(!data) return

        setDiscountTimeLeft(getDiscountTimeLeft())

        const interval = setInterval(() => {
            setDiscountTimeLeft(getDiscountTimeLeft())
        }, 60000)

        return () => clearInterval(interval)

    }, [data])

    useEffect(() => {
        window.lenis?.scrollTo(0, {
            immediate: true,
        });
    }, [pathname])

    useEffect(() => {
        window.lenis?.scrollTo(0, {
            immediate: true,
        });
        const fetchData = async () => {
            try{
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/product/${id}`)

                if(response.data){
                    setData(response.data.data)
                    setLoading(false)
                }
            }catch(err){
                console.log(err)
            }
        }

        fetchData()
    }, [pathname]);

    useEffect(() => {
        if(data){
            setRegion(Object.keys(data.price.subs)[0])
            const parsedDisocunt = JSON.parse(data.discount)
            const discountExpiry = parsedDisocunt.expiry
            let discountPercent = parsedDisocunt.percent
            if(new Date() > new Date(discountExpiry)){discountPercent = 0}
            setDiscount(discountPercent + data.realDiscount)
        }
    }, [data]);

    const checkAction = (item) => {
        if(token && user){
            if(passwordRequiredCategories.includes(data.category)){
                setPanel("Order")
                setOrderBody({
                    userId: user.id,
                    productId: id,
                    name: item.name
                })
            }else{
                setOrderBody({
                    userId: user.id,
                    productId: id,
                    name: item.name
                })
                orderProduct()
            }
        }else{
            setPanel("Login")
        }
        window.scrollTo(0, 0)
    }
    
    const orderProduct = async () => {
        try{
            await axios({
                method: "post",
                url: `${import.meta.env.VITE_BACKEND_URL}/api/orders`,
                data: {
                    userId: user.id,
                    productId: id,
                    quantity: 1,
                    info: {
                        region: region,
                        name: orderBody.name,
                        username: orderBody.username,
                        password: orderBody.password,
                        code: orderBody.code
                    }
                },
                headers: {authorization: token}
            })
            toast.success("سفارش شما با موفقیت ثبت شد!");
            setPanel(null)
        }catch(err){
            console.log(err)
            toast.success("ثبت سفارش با خطا مواجه شد.");
            setPanel(null)
        }
    }

    const handleDeleteProduct = async () => {
        try{
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`, {headers: {authorization: token}})
            navigate("/")
        }catch(err){
            console.log(err)
        }
    }

    const parseDiscountForEdit = (discountStr) => {
        try{
            const parsed = JSON.parse(discountStr)
            return {
                percent: parsed.percent || 0,
                expires: parsed.expires ? parsed.expires.slice(0, 16) : ""
            }
        }catch(err){
            return { percent: 0, expires: "" }
        }
    }

    const openUpdatePanel = () => {
        const regions = Object.entries(data.price.subs).map(([name, items]) => ({
            name,
            items: items.map((item) => ({...item}))
        }))

        const parsedDiscount = parseDiscountForEdit(data.discount)

        setEditForm({
            title: data.title || "",
            category: data.category || "",
            publisher: data.publisher || "",
            dlc: data.dlc || "ندارد",
            info: data.info || "",
            recommended: data.recommended || "",
            minimum: data.minimum || "",
            initialPrice: data.price.initial,
            regions,
            discountPercent: parsedDiscount.percent,
            discountExpires: parsedDiscount.expires
        })

        setPanel("Edit")
    }

    const updateRegionName = (regionIndex, value) => {
        const regions = [...editForm.regions]
        regions[regionIndex] = {...regions[regionIndex], name: value}
        setEditForm({...editForm, regions})
    }

    const updateItemField = (regionIndex, itemIndex, field, value) => {
        const regions = [...editForm.regions]
        const items = [...regions[regionIndex].items]
        items[itemIndex] = {...items[itemIndex], [field]: field === "price" ? Number(value) : value}
        regions[regionIndex] = {...regions[regionIndex], items}
        setEditForm({...editForm, regions})
    }

    const addRegion = () => {
        setEditForm({
            ...editForm,
            regions: [...editForm.regions, {name: "", items: [{tag: "US", name: "", price: 0}]}]
        })
    }

    const removeRegion = (regionIndex) => {
        setEditForm({
            ...editForm,
            regions: editForm.regions.filter((_, i) => i !== regionIndex)
        })
    }

    const addItem = (regionIndex) => {
        const regions = [...editForm.regions]
        regions[regionIndex] = {
            ...regions[regionIndex],
            items: [...regions[regionIndex].items, {tag: "US", name: "", price: 0}]
        }
        setEditForm({...editForm, regions})
    }

    const removeItem = (regionIndex, itemIndex) => {
        const regions = [...editForm.regions]
        regions[regionIndex] = {
            ...regions[regionIndex],
            items: regions[regionIndex].items.filter((_, i) => i !== itemIndex)
        }
        setEditForm({...editForm, regions})
    }

    const handleUpdateProduct = async () => {
        try{
            const subs = {}
            editForm.regions.forEach((r) => {
                subs[r.name] = r.items
            })

            const discountPayload = Number(editForm.discountPercent) > 0
                ? JSON.stringify({
                    percent: Number(editForm.discountPercent),
                    expires: editForm.discountExpires ? new Date(editForm.discountExpires).toISOString() : null
                })
                : JSON.stringify({ percent: 0 })

            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`, {
                title: editForm.title,
                category: editForm.category,
                price: {
                    subs,
                    initial: Number(editForm.initialPrice)
                },
                discount: discountPayload,
                info: editForm.info,
                recommended: editForm.recommended,
                minimum: editForm.minimum,
                publisher: editForm.publisher,
                dlc: editForm.dlc
            }, {
                headers: { authorization: token }
            })

            toast.success("محصول با موفقیت بروزرسانی شد!")
            setPanel(null)

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/product/${id}`)

            if(response.data){
                setData(response.data.data)
            }
        }catch(err){
            console.log(err)
            toast.error("بروزرسانی محصول با خطا مواجه شد.")
        }
    }

    if(loading){
        return <div className="flex justify-center items-center h-screen">
            درحال دریافت اطلاعات...
        </div>
    }

    if(!data){
        return null
    }

    return (<>
        <AnimatePresence mode="wait">
            {panel == "Order" && (
                <motion.div
                    key="order-panel"
                    initial={{ opacity: 0, x: 1000 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -1000 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className='flex items-center justify-center h-screen w-screen fixed z-5000 bg-bg-primary top-0'
                >
                    <p className='absolute top-10 left-10 flex items-center gap-1 cursor-pointer hover:text-text-secondary duration-300' onClick={() => setPanel(null)}>بازگشت<IoIosArrowBack/></p>
                    <div className="bg-bg-secondary w-[80%] max-w-md mx-auto rounded-3xl p-8 shadow-2xl border border-white/5 flex flex-col gap-6">
                        <h2 className="text-2xl font-bold text-center">
                            اطلاعات اکانت {data.category}
                        </h2>
                        <p className="text-text-secondary text-center text-sm">
                            لطفاً اطلاعات اکانتی که می‌خواید بازی روی اون فعال بشه رو وارد کنید.
                        </p>
                        <div className="flex flex-col gap-5">
                            <input
                                type="text"
                                placeholder="نام کاربری"
                                onChange={(e) => setOrderBody({...orderBody, username: e.target.value})}
                                className="bg-bg-primary border border-transparent rounded-2xl px-5 py-4 outline-none transition-all duration-200 placeholder:text-text-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                            />
                            <input
                                type="password"
                                placeholder="رمز عبور"
                                onChange={(e) => setOrderBody({...orderBody, password: e.target.value})}
                                className="bg-bg-primary border border-transparent rounded-2xl px-5 py-4 outline-none transition-all duration-200 placeholder:text-text-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                            />
                            {data.category == "Steam" && <input
                                type="text"
                                placeholder="کد استیم گارد سالم"
                                onChange={(e) => setOrderBody({...orderBody, code: e.target.value})}
                                className="bg-bg-primary border border-transparent rounded-2xl px-5 py-4 outline-none transition-all duration-200 placeholder:text-text-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                            />}
                            {data.category == "Discord" && <input
                                type="text"
                                placeholder="ریکاوری کد"
                                onChange={(e) => setOrderBody({...orderBody, code: e.target.value})}
                                className="bg-bg-primary border border-transparent rounded-2xl px-5 py-4 outline-none transition-all duration-200 placeholder:text-text-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                            />}
                        </div>
                        <button
                        onClick={() => orderProduct()}
                            className="bg-accent-primary hover:bg-accent-secondary duration-300 rounded-2xl py-4 font-semibold text-white shadow-lg hover:shadow-accent-primary/30"
                        >
                            ثبت سفارش
                        </button>
                    </div>
                </motion.div>
        )}
        {panel == "Edit" && editForm && (
            <motion.div
                key="edit-panel"
                initial={{ opacity: 0, x: 1000 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -1000 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className='flex items-center justify-center h-screen w-screen fixed z-5000 bg-bg-primary top-0'
            >
                <p className='absolute top-10 left-10 flex items-center gap-1 cursor-pointer hover:text-text-secondary duration-300' onClick={() => setPanel(null)}>بازگشت<IoIosArrowBack/></p>
                <div data-lenis-prevent className="show-scrollbar bg-bg-secondary w-[90%] max-w-2xl mx-auto rounded-3xl p-8 shadow-2xl border border-white/5 flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold text-center">ویرایش محصول</h2>

                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-text-secondary">عنوان</p>
                        <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            className="bg-bg-primary border border-transparent rounded-2xl px-5 py-4 outline-none transition-all duration-200 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-text-secondary">دسته بندی</p>
                            <input
                                type="text"
                                value={editForm.category}
                                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                className="bg-bg-primary border border-transparent rounded-2xl px-5 py-4 outline-none transition-all duration-200 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-text-secondary">انتشار دهنده</p>
                            <input
                                type="text"
                                value={editForm.publisher}
                                onChange={(e) => setEditForm({...editForm, publisher: e.target.value})}
                                className="bg-bg-primary border border-transparent rounded-2xl px-5 py-4 outline-none transition-all duration-200 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-text-secondary">DLC</p>
                        <select
                            value={editForm.dlc}
                            onChange={(e) => setEditForm({...editForm, dlc: e.target.value})}
                            className="bg-bg-primary border border-transparent rounded-2xl px-5 py-4 outline-none transition-all duration-200 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                        >
                            <option value="ندارد">ندارد</option>
                            <option value="دارد">دارد</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-text-secondary">قیمت پایه (initial)</p>
                        <input
                            type="number"
                            value={editForm.initialPrice}
                            onChange={(e) => setEditForm({...editForm, initialPrice: e.target.value})}
                            className="bg-bg-primary border border-transparent rounded-2xl px-5 py-4 outline-none transition-all duration-200 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-text-secondary">ریجن ها و قیمت ها</p>
                            <p onClick={addRegion} className="text-accent-primary text-sm flex items-center gap-1 cursor-pointer hover:text-accent-primary/70"><IoMdAdd/> افزودن ریجن</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            {editForm.regions.map((regionItem, regionIndex) => (
                                <div key={regionIndex} className="bg-bg-primary rounded-2xl p-4 flex flex-col gap-3 border border-white/5">
                                    <div className="flex justify-between items-center gap-3">
                                        <input
                                            type="text"
                                            value={regionItem.name}
                                            onChange={(e) => updateRegionName(regionIndex, e.target.value)}
                                            placeholder="نام ریجن"
                                            className="bg-bg-secondary border border-transparent rounded-xl px-4 py-2 outline-none flex-1 focus:border-accent-primary"
                                        />
                                        <p onClick={() => removeRegion(regionIndex)} className="text-red-400 cursor-pointer text-[10px] md:text-sm hover:text-red-300 shrink-0">حذف ریجن</p>
                                    </div>

                                    {regionItem.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="grid grid-cols-4 gap-2 items-center">
                                            <input
                                                type="text"
                                                value={item.tag}
                                                onChange={(e) => updateItemField(regionIndex, itemIndex, "tag", e.target.value)}
                                                placeholder="کد کشور"
                                                className="bg-bg-secondary border border-transparent rounded-xl px-3 py-2 outline-none focus:border-accent-primary"
                                            />
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => updateItemField(regionIndex, itemIndex, "name", e.target.value)}
                                                placeholder="نام"
                                                className="bg-bg-secondary border border-transparent rounded-xl px-3 py-2 outline-none focus:border-accent-primary"
                                            />
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => updateItemField(regionIndex, itemIndex, "price", e.target.value)}
                                                placeholder="قیمت"
                                                className="bg-bg-secondary border border-transparent rounded-xl px-3 py-2 outline-none focus:border-accent-primary"
                                            />
                                            <p onClick={() => removeItem(regionIndex, itemIndex)} className="text-red-400 cursor-pointer text-sm text-center hover:text-red-300">حذف</p>
                                        </div>
                                    ))}

                                    <p onClick={() => addItem(regionIndex)} className="text-accent-primary text-sm cursor-pointer flex items-center gap-1 w-fit hover:text-accent-primary/70"><IoMdAdd/> افزودن آیتم</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-text-secondary">تخفیف</p>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={editForm.discountPercent}
                                onChange={(e) => setEditForm({...editForm, discountPercent: e.target.value})}
                                placeholder="درصد تخفیف"
                                className="bg-bg-primary border border-transparent rounded-2xl px-5 py-4 outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                            />
                            <input
                                type="datetime-local"
                                disabled={Number(editForm.discountPercent) <= 0}
                                value={editForm.discountExpires}
                                onChange={(e) => setEditForm({...editForm, discountExpires: e.target.value})}
                                className="bg-bg-primary border border-transparent rounded-2xl px-5 py-4 outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 disabled:opacity-40"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-text-secondary">توضیحات (HTML)</p>
                        <textarea
                            dir="ltr"
                            rows={6}
                            value={editForm.info}
                            onChange={(e) => setEditForm({...editForm, info: e.target.value})}
                            className="bg-bg-primary border border-transparent rounded-2xl px-5 py-4 outline-none transition-all duration-200 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 font-mono text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-text-secondary">حداقل سیستم مورد نیاز (HTML)</p>
                        <textarea
                            dir="ltr"
                            rows={4}
                            value={editForm.minimum}
                            onChange={(e) => setEditForm({...editForm, minimum: e.target.value})}
                            className="bg-bg-primary border border-transparent rounded-2xl px-5 py-4 outline-none transition-all duration-200 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 font-mono text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-text-secondary">سیستم پیشنهادی (HTML)</p>
                        <textarea
                            dir="ltr"
                            rows={4}
                            value={editForm.recommended}
                            onChange={(e) => setEditForm({...editForm, recommended: e.target.value})}
                            className="bg-bg-primary border border-transparent rounded-2xl px-5 py-4 outline-none transition-all duration-200 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 font-mono text-sm"
                        />
                    </div>

                    <button
                        onClick={handleUpdateProduct}
                        className="bg-accent-primary hover:bg-accent-secondary duration-300 rounded-2xl py-4 font-semibold text-white shadow-lg hover:shadow-accent-primary/30"
                    >
                        ذخیره تغییرات
                    </button>
                </div>
            </motion.div>
        )}
        </AnimatePresence>
        <motion.div
                    key="product-page"
                    initial={{ opacity: 0, x: -1000 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 1000 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                    {panel == "Login" && <div className='flex items-center justify-center h-screen w-screen fixed top-0 left-0 z-5000 bg-bg-primary/90'>
                        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y:0}} className='bg-bg-secondary px-12 py-6 rounded-3xl flex flex-col items-center gap-5'>
                            <p>لطفا قبل از سفارش <Link to="/Login" className='border-b border-accent-primary cursor-pointer'>وارد اکانت</Link> خودتون بشید!</p>
                            <p className='text-accent-primary bg-bg-primary rounded-[10px] px-3 py-2 cursor-pointer' onClick={() => setPanel(null)}>باشه</p>
                        </motion.div>
                        </div>}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ duration: 0.8 }}
                        className="h-[70vh] overflow-hidden relative z-4"
                        style={{
                            backgroundImage: `linear-gradient(to top, var(--color-bg-primary) 0%, transparent 70%), url(${import.meta.env.VITE_BACKEND_URL}${data.banner})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                        }}
                    />
                    <div className="px-6 lg:px-40 -mt-90 z-5 relative gap-10 flex flex-col">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className='flex justify-between items-center max-md:flex-col max-md:gap-10'
                        >
                            <div className='flex gap-5'>
                                <div className='flex flex-col gap-5'>
                                    <img className='w-70 object-cover rounded-2xl' src={`${import.meta.env.VITE_BACKEND_URL}${data.image}`} alt={data.title} />
                                    <div className='flex items-center gap-10'>
                                        <h1 className="text-4xl">{data.title}</h1>
                                        {user && (
                                            user.role == "admin" && <div className='text-1xl gap-5 flex text-center'>
                                            <p onClick={() => openUpdatePanel()} className='bg-accent-primary px-2 py-3 rounded-xl cursor-pointer hover:bg-accent-primary/70 duration-300 border border-text-primary'>اپدیت کردن محصول</p>
                                            <p onClick={() => handleDeleteProduct()} className='bg-accent-primary px-2 py-3 rounded-xl cursor-pointer hover:bg-accent-primary/70 duration-300 border border-text-primary'>حذف محصول</p>
                                        </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className='flex gap-8 items-center'>
                                <div>
                                    <p className='text-text-secondary text-[12px]'>DLC</p>
                                    <p className='text-xl'>{data.dlc}</p>
                                </div>
                                <div>
                                    <p className='text-text-secondary text-[12px]'>دسته بندی</p>
                                    <Link to={`/Products?c=${data.category}`} className='text-xl hover:text-text-primary/80 duration-300'>{data.category}</Link>
                                </div>
                                <div>
                                    <p className='text-text-secondary text-[12px]'>انتشار دهنده</p>
                                    <p className='text-xl'>{data.publisher}</p>
                                </div>
                                {data.minimum &&
                                    <a href="#requiredSys" className="text-text-secondary text-xl hover:text-text-primary duration-200">سیستم مورد نیاز</a>
                                }
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="flex flex-col gap-4"
                        >
                            <p>لطفا ریجن مورد نظر خود را وارد کنید:</p>
                            <div className="md:flex gap-3 grid grid-cols-2">
                                {Object.keys(data.price.subs).map((item) => (
                                    <p key={Math.random()} onClick={() => setRegion(item)} className={`bg-bg-secondary hover:bg-bg-secondary/70 duration-200 px-6 py-2 rounded-2xl cursor-pointer flex items-center gap-3 justify-center ${region === item ? "border border-accent-primary" : "border border-accent-secondary"}`} ><img className='w-6 rounded-2xl' src={`https://flagsapi.com/${data.price.subs[item][0].tag}/flat/32.png`} alt={item} />{item}</p>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="md:w-[70vw] relative"
                        >
                            {discount > 0 && <p className='absolute -top-6 -left-6 text-xl bg-bg-secondary text-accent-primary p-3 rounded-full -rotate-27 z-10'>{discount}%</p>}
                            {discount > 0 && <p className='bg-bg-secondary absolute px-5 py-3 rounded-2xl text-accent-secondary font-bold text-sm z-10 -top-7 left-12'>
                                {getDiscountTimeLeft()}
                            </p>}
                            <div
                                data-lenis-prevent
                                className="show-scrollbar bg-bg-secondary p-2 rounded-xl flex flex-col gap-2 max-h-[25rem] overflow-y-auto"
                            >
                                {data.price.subs[region] && data.price.subs[region].map((item) => (
                                    <div key={Math.random()} onClick={() => checkAction(item)} className="flex justify-between w-full bg-bg-primary p-4 cursor-pointer rounded-xl items-center border border-bg-secondary hover:border-accent-primary/50 hover:bg-bg-primary/80 duration-300 max-md:flex-col gap-2">
                                        <p className='md:hidden text-center'>{item.name}</p>
                                        <div className='flex justify-between w-full items-center'>
                                            <p className='flex gap-2 md:gap-0 md:flex-col items-center'><img className='w-6' src={`https://flagsapi.com/${item.tag}/flat/32.png`} alt={item.tag} />{region}</p>
                                            <p className='hidden md:block text-center'>{item.name}</p>
                                            <div className='flex items-center gap-6'>
                                                {discount > 0 ? (<>
                                                    <del className='text-10 text-text-secondary'>{Math.floor(item.price / (1 - discount / 100)).toLocaleString("fa-IR")}</del>
                                                    <p className='text-xl flex items-center gap-2'>{item.price.toLocaleString("fa-IR")} <PriceSVG/></p>
                                                </>): (
                                                    <p className='text-xl flex items-center gap-2'>{item.price.toLocaleString("fa-IR")} <PriceSVG/></p>
                                                )}
                                                <IoMdAdd size={29}/>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                            className='flex flex-col gap-2'
                        >
                            <p className='text-xl text-red-600'>توجه!</p>
                            {data.category == "Steam" && <>
                                <p>قبل از ثبت سفارش <Link target='_blank' to="/steam-guard" className="text-red-600 border-b">استیم گارد</Link> خودتون رو خاموش کنید</p>
                                <p>اگه ریجن اکانتتون ایران باشه میتونید هر ریجنی خواستید سفارش بدید.</p>    
                            </>}
                            <p>قیمت های وبسایت هر 10 ساعت یکبار بروز میشوند!</p>
                            <p>تمامی محصولات دیجیتال بوده و نسخه فیزیکی برای شما ارسال نمیشود.</p>
                            <p>اطلاعات خود را قبل از ثبت سفارش بررسی کنید. اطلاعات بعد از ثبت قابل تغییر نیستند.</p>
                        </motion.div>
                        <div className='flex flex-col gap-3 px-6 lg:px-40 py-10'>
                            <p className='flex items-center gap-2 text-lg font-medium'><FaCircleInfo/> درمورد محصول:</p>
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.6 }}
                                dir='ltr'
                                className={`bg-bg-secondary rounded-2xl p-5 md:p-10 flex flex-col gap-6 leading-loose text-text-secondary [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-serif [&_h2]:text-text-primary [&_h2]:mt-6 [&_h2]:first:mt-0 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-bg-primary/50 [&_span]:block [&_span]:my-4 [&_video]:w-full [&_video]:rounded-2xl [&_video]:shadow-lg [&_video]:shadow-black/40 [&_video]:border [&_video]:border-bg-primary/50 [&_video]:h-auto [&_video]:aspect-video [&_video]:object-cover ${data.steamId ? "text-left" : "text-right rlt"}`}
                                dangerouslySetInnerHTML={{ __html: data.info }}
                            />
                        </div>
                        {data.minimum && <div className='flex flex-col gap-3 scroll-mt-40' id='requiredSys'>
                            <p className='flex items-center gap-2'><FaMicrochip/> حداقل سیستم مورد نیاز:</p>
                            <div
                                dir='ltr'
                                className="bg-bg-secondary rounded-xl p-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-3 [&_li]:flex [&_li]:flex-col [&_li]:items-start [&_li]:gap-1 md:[&_li]:flex-row md:[&_li]:justify-between md:[&_li]:items-center [&_li]:text-sm md:[&_li]:text-base [&_li]:text-text-secondary [&_li]:border-b [&_li]:border-bg-primary/40 [&_li]:pb-2 [&_li]:last:border-none [&_strong]:text-text-primary [&_strong]:font-medium md:[&_strong]:min-w-24"
                                dangerouslySetInnerHTML={{ __html: data.minimum }}
                            />
                        </div>}
                        {data.recommended && <div className='flex flex-col gap-3'>
                            <p className='flex items-center gap-2'><FaMicrochip/> سیستم پیشنهادی:</p>
                            <div
                                dir='ltr'
                                className="bg-bg-secondary rounded-xl p-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-3 [&_li]:flex [&_li]:flex-col [&_li]:items-start [&_li]:gap-1 md:[&_li]:flex-row md:[&_li]:justify-between md:[&_li]:items-center [&_li]:text-sm md:[&_li]:text-base [&_li]:text-text-secondary [&_li]:border-b [&_li]:border-bg-primary/40 [&_li]:pb-2 [&_li]:last:border-none [&_strong]:text-text-primary [&_strong]:font-medium md:[&_strong]:min-w-24"
                                dangerouslySetInnerHTML={{ __html: data.recommended }}
                            />
                        </div>}
                        </div>
                </motion.div>
    </>);
};

export default Product;