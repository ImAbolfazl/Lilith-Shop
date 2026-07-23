import React, {useState, useEffect, useContext} from 'react'
import { useParams } from 'react-router'
import axios from "axios"
import PriceSVG from '../components/priceSVG'
import {UserContext} from "../App.jsx";

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

  useEffect(() => {
    window.scrollTo(0, 0)

    const fetchData = async () => {
      try {
        const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/products/product/${id}`
        )

        if (!response.data || !response.data.data) {
          setError(true)
          setLoading(false)
          return
        }

        setData(response.data.data)
        setLoading(false)
      } catch (err) {
        console.log(err)
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

    if (!steamUsername.trim() || !steamPassword.trim()) {
      setSteamError("لطفاً نام کاربری و رمز عبور استیم خود را وارد کنید.")
      return
    }

    setSteamError("")

    try {
      const selectedPrice = data.price.find(p => p.country === region)

      const response = await axios({
        method: "POST",
        url: `${import.meta.env.VITE_BACKEND_URL}/api/orders`,
        headers: {"authorization": token},
        data: {
          userId: user.id,
          productId: data.id,
          quantity: 1,
          info: {
            region: region,
            steamUsername: steamUsername,
            steamPassword: steamPassword
          }
        }
      })

      if (response.data.status == "success") {
        alert("به سبد خرید اضافه شد")
      }
    } catch (err) {
      console.log(err)
      alert("خطا در افزودن به سبد خرید")
    }
  }

  if (loading) {
    return (
        <div className='flex items-center justify-center text-2xl h-screen opacity-70'>
          درحال گرفتن اطلاعات...
        </div>
    )
  }

  if (error || !data) {
    return (
        <div className='flex items-center justify-center text-2xl h-screen text-red-500'>
          خطا در دریافت اطلاعات محصول
        </div>
    )
  }

  const selectedPrice = data.price.find(p => p.country === region)

  if(data){
    return (
        <>
          <div
              className="h-[70vh] overflow-hidden relative opacity-60"
              style={{
                backgroundImage: `linear-gradient(to top, var(--color-bg-primary) 0%, transparent 70%), url(${import.meta.env.VITE_BACKEND_URL}${data.banner})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
          />

          <div className="relative z-20 -mt-80 max-w-6xl mx-auto px-6 flex flex-col gap-16">

            <h1 className='md:text-6xl text-4xl font-extrabold text-text-primary leading-tight'>
              {data.title}
            </h1>

            <div className='flex flex-col gap-8 w-full'>

              <div className='flex flex-col gap-3'>
                <p className='text-lg text-text-secondary'>ریجن اکانت خودتون رو انتخاب کنید:</p>

                <div className='flex flex-wrap gap-3'>
                  {data.price.map(price => (
                      <button
                          key={price.country}
                          className={`py-2 px-5 rounded-full text-sm transition border 
                    ${price.country === region
                              ? "bg-text-primary text-bg-primary border-text-primary"
                              : "bg-bg-secondary border-bg-secondary hover:bg-bg-primary hover:text-text-primary"
                          }`}
                          onClick={() => setRegion(price.country)}
                      >
                        {price.persian}
                      </button>
                  ))}
                </div>
              </div>

              <div className='flex items-center gap-3 text-4xl font-bold'>
                <p>{data?.discount > 0 ? Math.round(selectedPrice?.price * (1 - data.discount / 100)).toLocaleString("fa-IR"): selectedPrice?.price.toLocaleString("fa-IR")}</p>
                <PriceSVG />
              </div>

              <div className="grid md:grid-cols-2 grid-cols-1 gap-10 w-full">

                <div className="flex flex-col gap-4 bg-bg-secondary p-5 rounded-xl">
                  <p className="text-lg font-bold text-text-primary">اطلاعات ورود استیم (اجباری)</p>

                  <input
                      type="text"
                      placeholder="نام کاربری استیم"
                      className="bg-bg-primary border border-bg-secondary rounded-lg py-2 px-4 text-sm"
                      value={steamUsername}
                      onChange={(e) => setSteamUsername(e.target.value)}
                  />

                  <input
                      type="password"
                      placeholder="رمز عبور استیم"
                      className="bg-bg-primary border border-bg-secondary rounded-lg py-2 px-4 text-sm"
                      value={steamPassword}
                      onChange={(e) => setSteamPassword(e.target.value)}
                  />

                  {steamError && (
                      <p className="text-red-500 text-sm">{steamError}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6 text-right">

                  <div>
                    <p className='text-text-secondary text-sm'>دسته بندی</p>
                    <p className='text-lg'>{data.category}</p>
                  </div>

                  <div>
                    <p className='text-text-secondary text-sm'>سازنده</p>
                    <p className='text-lg'>{data.publisher}</p>
                  </div>

                  <div>
                    <p className='text-text-secondary text-sm'>DLC</p>
                    <p className='text-lg'>{data.dlc}</p>
                  </div>

                  {data.category === "Steam" && (
                      <div>
                        <a href='#requiredSys' className='text-lg text-text-secondary hover:text-text-primary transition'>
                          سیستم مورد نیاز
                        </a>
                      </div>
                  )}

                </div>
              </div>

              <button
                  className="bg-text-primary text-bg-primary py-3 px-8 rounded-xl text-xl font-bold hover:opacity-80 transition w-fit"
                  onClick={handleAddToCart}
              >
                افزودن به سبد خرید
              </button>
            </div>

            <div className='flex flex-col gap-4 text-right'>
              <p className='md:text-xl font-bold text-red-600'>
                اگر DLC بازی رو میخواید لطفا به پشتیبانی پیام بدید.
              </p>

              {data.category === "Steam" && (
                  <>
                    <p>
                      <span className='text-red-600 font-bold'>توجه:</span> اگر ریجن اکانتتون ایران باشه میتونید هر ریجنی خواستید انتخاب کنید.
                    </p>
                    <p>قبل از سفارش استیم گارد خودتون رو خاموش کنید</p>
                  </>
              )}
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
                className='p-5 [&_img]:rounded-xl [&_img]:h-28 [&_video]:rounded-xl [&_video]:h-48 flex flex-col gap-6 text-left'
                dangerouslySetInnerHTML={{ __html: data.info }}
            />
          </div>
        </>
    )
  }
}

export default Product
