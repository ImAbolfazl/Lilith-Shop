import React from 'react';
import axios from "axios";

const Dashboard = () => {
    document.title = "Lilith | Dashboard";

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData();
        formData.append('title', form.title.value);
        formData.append('category', form.category.value);
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
            
            form.title.value = ""
            form.category.value = ""
            form.price.value = ""
            form.currency.value = ""
            form.info.value = ""
            alert("Product uploaded successfully!");
            form.reset()
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        }
    };

    return (
        <div className='flex items-center justify-center h-screen'>
            <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
                <input name="title" type="text" placeholder='title' required />
                <input name="category" type="text" placeholder='category' required />
                <input name="image" type="file" accept='image/*' required />
                <input name="banner" type="file" accept='image/*' />
                <input name="price" type="number" placeholder='price' required />
                <input name="currency" type="text" placeholder='currency' required />
                <textarea name="info" rows={5} placeholder='info' required />
                <button type="submit">Upload</button>
            </form>
        </div>
    );
};

export default Dashboard;