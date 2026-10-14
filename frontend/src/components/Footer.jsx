import React from "react";
import logo from "../assets/logo.png"

const Footer = () => {
  return (
    <footer className="bg-bg-secondary border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-14">

        <div className="grid md:grid-cols-4 gap-10">

          <div>
            <img src={logo} alt="Lilith" className="h-14"/>
            <p className="text-text-secondary leading-7">
              فروش انواع گیفت کارت و
              سرویس‌های دیجیتال با بهترین قیمت.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">دسترسی سریع</h3>

            <div className="flex flex-col gap-2 text-text-secondary">
              <a href="/">خانه</a>
              <a href="/Products?c=Steam">خدمات استیم</a>
              <a href="/Products?c=MineCraft">خدمات ماینکرفت</a>
              <a href="/Products?c=All">سایر خدمات</a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">پشتیبانی</h3>

            <div className="flex flex-col gap-2 text-text-secondary">
              <a href="/faq">سوالات متداول</a>
              <a href="/contact">ارتباط با ما</a>
              <a href="/rules">قوانین خرید</a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">ارتباط</h3>

            <div className="space-y-2 text-text-secondary">
              <p className="font-bold">پشتیبانی 9 صبح الی 11 شب</p>

              <a
                href="telegram"
                target="_blank"
                className="block hover:text-white transition"
              >
                تلگرام
              </a>

              <a
                href="discord"
                target="_blank"
                className="block hover:text-white transition"
              >
                دیسکورد
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-text-secondary">

          <p>
            &#169; {new Date().getFullYear()} Lilith. All rights reserved.
          </p>

          <p>
            Developed & Maintained by{" "}
            <a
              href="https://github.com/ImAbolfazl"
              target="_blank"
              rel="noreferrer"
              className="text-pink-500 hover:text-pink-400 transition"
            >
              Abolfazl
            </a>
          </p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;