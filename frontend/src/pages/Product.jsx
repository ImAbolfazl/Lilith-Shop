import React, {useState, useEffect, useContext} from 'react'
import { useParams } from 'react-router'
import axios from "axios"
import PriceSVG from '../components/priceSVG'
import {UserContext} from "../App.jsx"
import toast, {Toaster} from "react-hot-toast"

const Product = () => {
    const id = useParams().id
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [region, setRegion] = useState(null)
    const [steamUsername, setSteamUsername] = useState("")
    const [steamPassword, setSteamPassword] = useState("")
    const [steamError, setSteamError] = useState("")
    const {user, token} = useContext(UserContext)
    const [selectedPrice, setSelectedPrice] = useState(null)
    const [adminModal, setAdminModal] = useState(false)
    const [rawData, setRawData] = useState(null)
    const [rawLoading, setRawLoading] = useState(false)
    const [rawError, setRawError] = useState(false)
    const [savingProduct, setSavingProduct] = useState(false)
    const [priceJsonError, setPriceJsonError] = useState(false)
    let needsInput

    const successToast = text => {
        toast.custom(t => (
            <div className={`fixed top-5 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl bg-[var(--color-accent-primary)] text-[var(--color-text-primary)] shadow-2xl flex items-center gap-4 transform transition-all duration-300 ${t.visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
                <div className="w-3 h-3 bg-[var(--color-text-primary)] rounded-full" />
                <p className="text-base font-bold">{text}</p>
            </div>
        ))
    }

    const errorToast = text => {
        toast.custom(t => (
            <div className={`fixed top-5 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl bg-[var(--color-accent-secondary)] text-[var(--color-text-primary)] shadow-2xl flex items-center gap-4 transform transition-all duration-300 ${t.visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
                <div className="w-3 h-3 bg-[var(--color-text-primary)] rounded-full" />
                <p className="text-base font-bold">{text}</p>
            </div>
        ))
    }

    useEffect(() => {
        window.scrollTo(0, 0)
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/product/${id}`)
                if (!response.data || !response.data.data) {
                    setError(true)
                    setLoading(false)
                    return
                }
                setData(response.data.data)
                setLoading(false)
            } catch {
                setError(true)
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    useEffect(() => {
        if (data) {
            document.title = `Lilith | ${data.title}`
            setRegion(data.price?.[0]?.country || null)
        }
    }, [data])

    const handleAddToCart = async () => {
        if (!data || !region) return
        if (needsInput && (!steamUsername.trim() || !steamPassword.trim())) {
            setSteamError("لطفاً نام کاربری و رمز عبور را وارد کنید.")
            errorToast("اطلاعات ورود ناقص است")
            return
        }
        setSteamError("")
        try {
            const response = await axios({
                method: "POST",
                url: `${import.meta.env.VITE_BACKEND_URL}/api/orders`,
                headers: {"authorization": token},
                data: {
                    userId: user.id,
                    productId: data.id,
                    quantity: 1,
                    info: {
                        region,
                        steamUsername,
                        steamPassword
                    }
                }
            })
            if (response.data.status === "success") {
                successToast("به سبد خرید اضافه شد")
            } else {
                errorToast("خطا در افزودن به سبد خرید")
            }
        } catch {
            errorToast("خطا در افزودن به سبد خرید")
        }
    }

    const openAdminModal = async () => {
        setAdminModal(true)
        setRawError(false)
        setPriceJsonError(false)
        setRawLoading(true)
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/products/product/${id}/raw`,
                { headers: { authorization: token } }
            )
            if (!response.data?.data) {
                setRawError(true)
            } else {
                const raw = response.data.data
                setRawData({
                    ...raw,
                    price: typeof raw.price === "string" ? JSON.parse(raw.price) : raw.price
                })
            }
        } catch {
            setRawError(true)
            errorToast("خطا در دریافت اطلاعات محصول برای ویرایش")
        } finally {
            setRawLoading(false)
        }
    }

    const handleAdminSave = async () => {
        if (!rawData) return
        setSavingProduct(true)
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/products`,
                {
                    id: rawData.id,
                    title: rawData.title,
                    category: rawData.category,
                    image: rawData.image,
                    banner: rawData.banner,
                    price: rawData.price,
                    discount: rawData.discount,
                    info: rawData.info,
                    recommended: rawData.recommended,
                    minimum: rawData.minimum,
                    publisher: rawData.publisher,
                    dlc: rawData.dlc
                },
                { headers: { authorization: token } }
            )
            if (response.data.status === "success") {
                successToast("محصول با موفقیت ویرایش شد")
                setAdminModal(false)
                setRawData(null)
                const refreshed = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/product/${id}`)
                if (refreshed.data?.data) setData(refreshed.data.data)
            } else {
                errorToast("خطا در ذخیره تغییرات")
            }
        } catch {
            errorToast("خطا در ارتباط با سرور")
        } finally {
            setSavingProduct(false)
        }
    }

    useEffect(() => {
        data?.price.map(p => {
            if (p.country === region) setSelectedPrice(p.price)
        })
    }, [region])

    if (loading) {
        return (
            <>
                <Toaster />
                <div className='flex items-center justify-center text-2xl h-screen opacity-70'>
                    درحال گرفتن اطلاعات...
                </div>
            </>
        )
    }

    if (error || !data) {
        return (
            <>
                <Toaster />
                <div className='flex items-center justify-center text-2xl h-screen text-red-500'>
                    خطا در دریافت اطلاعات محصول
                </div>
            </>
        )
    }

    needsInput = data.category === "Steam" || data.category === "Discord"

    return (
        <>
            <Toaster className="z-999" />

            {adminModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
                    onClick={() => { setAdminModal(false); setRawData(null) }}
                >
                    <div
                        className="bg-[var(--color-bg-secondary)] p-8 rounded-2xl w-full max-w-3xl flex flex-col gap-8 overflow-y-auto max-h-[90vh]"
                        onClick={e => e.stopPropagation()}
                    >

                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">ویرایش کامل محصول</h2>

                        {rawLoading && (
                            <p className="text-[var(--color-text-secondary)]">در حال دریافت اطلاعات...</p>
                        )}

                        {rawError && (
                            <div className="flex flex-col gap-3">
                                <p className="text-red-500">خطا در دریافت اطلاعات محصول</p>
                                <button onClick={openAdminModal} className="bg-[var(--color-accent-secondary)] text-[var(--color-text-primary)] px-4 py-2 rounded-xl text-sm font-bold hover:opacity-80 transition w-fit">تلاش دوباره</button>
                            </div>
                        )}

                        {rawData && !rawLoading && (
                            <>
                                <div className="flex flex-col gap-4">
                                    <p className="text-lg font-bold text-[var(--color-text-primary)]">اطلاعات اصلی</p>

                                    <label className="text-[var(--color-text-secondary)] text-sm">عنوان</label>
                                    <input className="bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] rounded-lg py-2 px-4 text-sm" defaultValue={rawData.title} onChange={e => setRawData(prev => ({...prev, title: e.target.value}))} />

                                    <label className="text-[var(--color-text-secondary)] text-sm">دسته بندی</label>
                                    <input className="bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] rounded-lg py-2 px-4 text-sm" defaultValue={rawData.category} onChange={e => setRawData(prev => ({...prev, category: e.target.value}))} />

                                    <label className="text-[var(--color-text-secondary)] text-sm">سازنده</label>
                                    <input className="bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] rounded-lg py-2 px-4 text-sm" defaultValue={rawData.publisher} onChange={e => setRawData(prev => ({...prev, publisher: e.target.value}))} />

                                    <label className="text-[var(--color-text-secondary)] text-sm">DLC</label>
                                    <input className="bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] rounded-lg py-2 px-4 text-sm" defaultValue={rawData.dlc} onChange={e => setRawData(prev => ({...prev, dlc: e.target.value}))} />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <p className="text-lg font-bold text-[var(--color-text-primary)]">رسانه‌ها</p>

                                    <label className="text-[var(--color-text-secondary)] text-sm">تصویر اصلی</label>
                                    <input className="bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] rounded-lg py-2 px-4 text-sm" defaultValue={rawData.image} onChange={e => setRawData(prev => ({...prev, image: e.target.value}))} />

                                    <label className="text-[var(--color-text-secondary)] text-sm">بنر</label>
                                    <input className="bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] rounded-lg py-2 px-4 text-sm" defaultValue={rawData.banner} onChange={e => setRawData(prev => ({...prev, banner: e.target.value}))} />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <p className="text-lg font-bold text-[var(--color-text-primary)]">قیمت‌ها</p>

                                    <label className="text-[var(--color-text-secondary)] text-sm">قیمت‌ها (JSON، بدون سود اعمال‌شده)</label>
                                    <textarea
                                        className="bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] rounded-lg py-2 px-4 text-sm h-24"
                                        defaultValue={JSON.stringify(rawData.price)}
                                        onChange={e => {
                                            try {
                                                const parsed = JSON.parse(e.target.value)
                                                setRawData(prev => ({...prev, price: parsed}))
                                                setPriceJsonError(false)
                                            } catch {
                                                setPriceJsonError(true)
                                            }
                                        }}
                                    />
                                    {priceJsonError && (
                                        <p className="text-red-500 text-xs">فرمت JSON قیمت‌ها نامعتبر است</p>
                                    )}

                                    <label className="text-[var(--color-text-secondary)] text-sm">درصد تخفیف</label>
                                    <input className="bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] rounded-lg py-2 px-4 text-sm" defaultValue={rawData.discount ?? ""} onChange={e => setRawData(prev => ({...prev, discount: e.target.value}))} />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <p className="text-lg font-bold text-[var(--color-text-primary)]">سیستم مورد نیاز</p>

                                    <label className="text-[var(--color-text-secondary)] text-sm">حداقل سیستم</label>
                                    <textarea className="bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] rounded-lg py-2 px-4 text-sm h-32" defaultValue={rawData.minimum || ""} onChange={e => setRawData(prev => ({...prev, minimum: e.target.value}))} />

                                    <label className="text-[var(--color-text-secondary)] text-sm">سیستم پیشنهادی</label>
                                    <textarea className="bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] rounded-lg py-2 px-4 text-sm h-32" defaultValue={rawData.recommended || ""} onChange={e => setRawData(prev => ({...prev, recommended: e.target.value}))} />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <p className="text-lg font-bold text-[var(--color-text-primary)]">اطلاعات اضافی (HTML)</p>

                                    <label className="text-[var(--color-text-secondary)] text-sm">HTML</label>
                                    <textarea className="bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] rounded-lg py-2 px-4 text-sm h-40" defaultValue={rawData.info || ""} onChange={e => setRawData(prev => ({...prev, info: e.target.value}))} />
                                </div>

                                <button
                                    onClick={handleAdminSave}
                                    disabled={savingProduct || priceJsonError}
                                    className={`bg-[var(--color-accent-primary)] text-[var(--color-text-primary)] px-6 py-3 rounded-xl font-bold transition ${savingProduct || priceJsonError ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                                >
                                    {savingProduct ? "در حال ذخیره..." : "ذخیره تغییرات"}
                                </button>
                            </>
                        )}

                        <button onClick={() => { setAdminModal(false); setRawData(null) }} className="bg-[var(--color-accent-secondary)] text-[var(--color-text-primary)] px-6 py-3 rounded-xl font-bold hover:opacity-80 transition">بستن</button>

                    </div>
                </div>
            )}

            <div
                className="h-[70vh] overflow-hidden relative opacity-60"
                style={{
                    backgroundImage: `linear-gradient(to top, var(--color-bg-primary) 0%, transparent 70%), url(${import.meta.env.VITE_BACKEND_URL}${data.banner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            />

            <div className="relative z-20 -mt-80 max-w-6xl mx-auto px-6 flex flex-col gap-16">

                <div className="flex flex-col gap-4">
                    <h1 className='md:text-6xl text-4xl font-extrabold text-[var(--color-text-primary)] leading-tight'>
                        {data.title}
                    </h1>

                    {user?.role === "admin" && (
                        <button
                            onClick={openAdminModal}
                            className="bg-[var(--color-accent-primary)] text-[var(--color-text-primary)] px-4 py-2 rounded-xl text-sm font-bold hover:opacity-80 transition w-fit"
                        >
                            ویرایش محصول
                        </button>
                    )}

                    <div className="flex gap-6 text-[var(--color-text-secondary)] text-sm md:text-base">
                        <p>وضعیت: <span className="text-green-400">موجود</span></p>
                        <p>تحویل: 10 تا 30 دقیقه</p>
                    </div>
                </div>

                {data.gallery?.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto py-4">
                        {data.gallery.map((img, i) => (
                            <img
                                key={i}
                                src={`${import.meta.env.VITE_BACKEND_URL}${img}`}
                                className="rounded-xl h-40 md:h-56 object-cover"
                            />
                        ))}
                    </div>
                )}

                <div className='flex flex-col gap-8 w-full'>

                    <div className='flex flex-col gap-3'>
                        <p className='text-lg text-[var(--color-text-secondary)]'>ریجن اکانت خودتون رو انتخاب کنید:</p>
                        <div className='flex flex-wrap gap-3'>
                            {data.price.map(price => (
                                <button
                                    key={price.country}
                                    className={`py-2 px-5 rounded-full text-sm transition border 
                    ${price.country === region
                                        ? "bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] border-[var(--color-text-primary)]"
                                        : "bg-[var(--color-bg-secondary)] border-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-primary)] hover:text-[var(--color-text-primary)]"
                                    }`}
                                    onClick={() => setRegion(price.country)}
                                >
                                    {price.persian}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='flex items-center gap-3 text-4xl font-bold text-[var(--color-text-primary)]'>
                        {data.discount ? (
                            <div className="flex gap-6 text-xl md:text-3xl">
                                <del className="text-[var(--color-text-secondary)]">{Number(selectedPrice).toLocaleString("fa-IR")}</del>
                                <p>{Math.round(selectedPrice * (1 - data.discount / 100)).toLocaleString("fa-IR")}</p>
                            </div>
                        ) : (
                            <p>{Number(selectedPrice).toLocaleString("fa-IR")}</p>
                        )}
                        <PriceSVG />
                    </div>

                    <div className="grid md:grid-cols-2 grid-cols-1 gap-10 w-full">

                        {needsInput && (
                            <div className="flex flex-col gap-4 bg-[var(--color-bg-secondary)] p-5 rounded-xl">
                                <p className="text-lg font-bold text-[var(--color-text-primary)]">اطلاعات ورود {data.category}</p>

                                <label className="text-[var(--color-text-secondary)] text-sm">نام کاربری</label>
                                <input
                                    type="text"
                                    placeholder={`نام کاربری ${data.category}`}
                                    className="bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] rounded-lg py-2 px-4 text-sm"
                                    value={steamUsername}
                                    onChange={(e) => setSteamUsername(e.target.value)}
                                />

                                <label className="text-[var(--color-text-secondary)] text-sm">رمز عبور</label>
                                <input
                                    type="password"
                                    placeholder={`رمز عبور ${data.category}`}
                                    className="bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] rounded-lg py-2 px-4 text-sm"
                                    value={steamPassword}
                                    onChange={(e) => setSteamPassword(e.target.value)}
                                />

                                {steamError && (
                                    <p className="text-red-500 text-sm">{steamError}</p>
                                )}
                            </div>
                        )}

                        <div className={`grid ${needsInput ? "grid-cols-2" : "grid-cols-3"} gap-6 text-right`}>
                            <div>
                                <p className='text-[var(--color-text-secondary)] text-sm'>دسته بندی</p>
                                <p className='text-lg text-[var(--color-text-primary)]'>{data.category}</p>
                            </div>

                            <div>
                                <p className='text-[var(--color-text-secondary)] text-sm'>سازنده</p>
                                <p className='text-lg text-[var(--color-text-primary)]'>{data.publisher}</p>
                            </div>

                            <div>
                                <p className='text-[var(--color-text-secondary)] text-sm'>DLC</p>
                                <p className='text-lg text-[var(--color-text-primary)]'>{data.dlc}</p>
                            </div>

                            {data.category === "Steam" && (
                                <div>
                                    <a href='#requiredSys' className='text-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition'>
                                        سیستم مورد نیاز
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        className="bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] py-3 px-8 rounded-xl text-xl font-bold hover:opacity-80 transition w-fit"
                        onClick={handleAddToCart}
                    >
                        افزودن به سبد خرید
                    </button>
                </div>

                {data.shortDesc && (
                    <div className="bg-[var(--color-bg-secondary)] p-6 rounded-xl text-right leading-8">
                        <h2 className="text-xl font-bold mb-3 text-[var(--color-text-primary)]">توضیحات کوتاه</h2>
                        <p className="text-[var(--color-text-secondary)]">{data.shortDesc}</p>
                    </div>
                )}

                {data.highlights && (
                    <div className="bg-[var(--color-bg-secondary)] p-6 rounded-xl text-right">
                        <h2 className="text-xl font-bold mb-3 text-[var(--color-text-primary)]">ویژگی‌های کلیدی</h2>
                        <ul className="list-disc pr-6 leading-8 text-[var(--color-text-secondary)]">
                            {data.highlights.map((h, i) => (
                                <li key={i}>{h}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className='flex flex-col gap-4 text-right text-[var(--color-text-primary)]'>
                    <p className='md:text-xl font-bold text-red-600'>اگر DLC بازی رو میخواید لطفا به پشتیبانی پیام بدید.</p>
                    {data.category === "Steam" && (
                        <>
                            <p><span className='text-red-600 font-bold'>توجه:</span> اگر ریجن اکانتتون ایران باشه میتونید هر ریجنی خواستید انتخاب کنید.</p>
                            <p>قبل از سفارش استیم گارد خودتون رو خاموش کنید</p>
                        </>
                    )}
                    <p>این محصول دیجیتالی بوده و امکان لغو یا بازگشت وجه وجود ندارد.</p>
                    <p>اطلاعات وارد شده بعد از ثبت سفارش قابل تغییر نیست.</p>
                </div>

                <div
                    className='md:flex md:flex-row flex flex-col gap-10 text-left mt-10 scroll-mt-[35vh]'
                    id='requiredSys'
                >
                    <div
                        className="prose prose-invert max-w-none dir-ltr text-center"
                        dangerouslySetInnerHTML={{ __html: data.recommended }}
                    />
                    <div
                        className="prose prose-invert max-w-none dir-ltr text-center"
                        dangerouslySetInnerHTML={{ __html: data.minimum }}
                    />
                </div>

                <div
                    dir='ltr'
                    className={`p-5 [&_img]:rounded-xl [&_img]:h-28 [&_video]:rounded-xl [&_video]:h-48 flex flex-col gap-6 ${data.steamId ? "text-left" : "text-right rlt"}`}
                    dangerouslySetInnerHTML={{ __html: data.info }}
                />

                <div className="bg-[var(--color-bg-secondary)] p-6 rounded-xl text-right">
                    <h2 className="text-xl font-bold mb-3 text-[var(--color-text-primary)]">پشتیبانی</h2>
                    <p className="text-[var(--color-text-secondary)]">در صورت نیاز به راهنمایی یا سوالات بیشتر، از طریق تلگرام یا واتساپ با ما در ارتباط باشید.</p>
                </div>

            </div>
        </>
    )
}

export default Product