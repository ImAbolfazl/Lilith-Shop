import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { UserContext } from '../App';
import { useNavigate } from 'react-router';

const Dashboard = () => {
    document.title = "Lilith | Dashboard";
    const [selected, setSelected] = useState("سبد خرید")
    const {token, setToken, user} = useContext(UserContext)
    const navigate = useNavigate()

    useEffect(() => {
        if(!token){
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
            form.reset()
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        }
    };

    return (
        // <div className='flex items-center justify-center h-screen'>
        //     <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
        //         <input name="title" type="text" placeholder='title' required />
        //         <input name="category" type="text" placeholder='category' required />
        //         <input name="publisher" type="text" placeholder='publisher' required />
        //         <label for="dlc">dlc</label>
        //         <select className='[&_option]:bg-bg-primary' id='dlc' name="dlc">
        //             <option value="دارد">دارد</option>
        //             <option value="ندارد">ندارد</option>
        //         </select>
        //         <input name="image" type="file" accept='image/*' required />
        //         <input name="banner" type="file" accept='image/*' />
        //         <input name="price" type="number" placeholder='price' required />
        //         <input name="currency" type="text" placeholder='currency' required />
        //         <textarea name="info" rows={5} placeholder='info' required />
        //         <button type="submit">Upload</button>
        //     </form>
        // </div>
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
            {selected == "امتیازات" &&
                <div className='md:w-[80vw]  max-md:h-[95vh] flex items-center justify-center h-full'>
                    <p>امتیازات</p>
                </div>
            }
            <div className='h-[5vh] md:h-[7vh] flex w-screen bg-bg-secondary justify-around items-center font-bold'>
                <p onClick={() => setSelected("سبد خرید")} className={`border border-text-primary w-full h-full flex items-center justify-center cursor-pointer ${selected == "سبد خرید" && "bg-accent-secondary"}`}>سبد خرید</p>
                <p onClick={() => setSelected("اطلاعات کاربر")} className={`border border-text-primary w-full h-full flex items-center justify-center cursor-pointer ${selected == "اطلاعات کاربر" && "bg-accent-secondary"}`}>اطلاعات کاربر</p>
                <p onClick={() => setSelected("امتیازات")} className={`border border-text-primary w-full h-full flex items-center justify-center cursor-pointer ${selected == "امتیازات" && "bg-accent-secondary"}`}>امتیازات</p>
                <p onClick={() => setToken(null)} className={`border border-text-primary w-full h-full flex items-center justify-center cursor-pointer bg-accent-secondary}`}>خروج از حساب</p>
            </div>
        </div>
    );
};

export default Dashboard;