import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import logo from "../assets/logo.png";
import { IoMdClose, IoMdArrowForward } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaMoon, FaSearch, FaUser } from "react-icons/fa";
import { MdSunny } from "react-icons/md";
import { UserContext } from "../App";
import Search from "./search.jsx";
import { AnimatePresence, motion } from "framer-motion";

const Header = () => {
  const [sideMenu, setSideMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { token, user } = useContext(UserContext);
  const location = useLocation();
  const dropdownTimeout = useRef(null);
  const headerRef = useRef(null);

  const steamDropdownMap = [
    { name: "خرید کیف پول استیم", path: "/Products?c=Steam" },
  ];

  const minecraftDropdownMap = [
    { name: "اگهی های ماینکرفت", path: "/Products?c=MineCraftAds" },
    { name: "خدمات هایپیکسل", path: "/Products?c=Hypixel" },
    { name: "خرید اکانت", path: "/Products?c=MineCraftAccount" },
  ];

  const callOfDutyDropdownMap = [
    { name: "خدمات کالاف دیوتی", path: "/Products?c=CallOfDuty" },
  ];

  const allDropDownMap = [
    { name: "وارکرفت", path: "/Products?c=WoW" },
    { name: "دیسکورد", path: "/Products?c=Discord" },
    { name: "تلگرام", path: "/Products?c=Telegram" },
    { name: "کیک", path: "/Products?c=Kick" },
    { name: "اپیک گیمز", path: "/Products?c=EpicGames" },
    { name: "توییچ", path: "/Products?c=Twitch" },
    { name: "اسپاتیفای", path: "/Products?c=Spotify" },
    { name: "پلی استیشین", path: "/Products?c=PlayStation" },
    { name: "خدمات کاهش پینگ", path: "/Products?c=PingReduction" },
    { name: "اشتراک هوش مصنوعی", path: "/Products?c=AI" },
    { name: "گوگل پلی", path: "/Products?c=GooglePlay" },
    { name: "رایت گیمز", path: "/Products?c=RiotGames" },
    { name: "بتل نت", path: "/Products?c=BattleNet" },
    { name: "فری فایر", path: "/Products?c=FreeFire" },
    { name: "اپل", path: "/Products?c=Apple" },
    { name: "پابجی", path: "/Products?c=Pubg" },
    { name: "پلاتو", path: "/Products?c=Plato" },
    { name: "سوپرسل", path: "/Products?c=Supercell" },
    { name: "روبلاکس", path: "/Products?c=Roblox" },
  ];

  const mainNavItems = [
    { name: "خدمات استیم", path: "/Products?c=Steam" },
    { name: "خدمات ماینکرفت", path: "/Products?c=MineCraft", dropdown: minecraftDropdownMap },
    { name: "خدمات کالاف دیوتی", path: "/Products?c=CallOfDuty", dropdown: callOfDutyDropdownMap },
    { name: "سایر خدمات", path: "/Products?c=All", dropdown: allDropDownMap },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 20;
      if (shouldShow !== scrolled) {
        setScrolled(shouldShow);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  useEffect(() => {
    setSideMenu(false);
  }, [location.pathname]);

  const toggleSearch = () => setSearch(!search);

  const handleDropdownEnter = (name) => {
    clearTimeout(dropdownTimeout.current);
    setActiveDropdown(name);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    const category = new URLSearchParams(path.split("?")[1]).get("c");
    const currentCategory = new URLSearchParams(location.search).get("c");
    if (category && currentCategory) {
      return category === currentCategory;
    }
    return location.pathname.startsWith(path.split("?")[0]);
  };

  const headerStyles = {
        borderColor: scrolled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0)",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "0 4px 30px rgba(0,0,0,0.4)",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
  }

  return (
    <>
      <AnimatePresence>{search && <Search toggleSearch={toggleSearch} />}</AnimatePresence>
      <header
        ref={headerRef}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] w-[94%] max-w-5xl rounded-2xl transition-all duration-300 ease-out bg-bg-primary/90"
        style={{
          padding: scrolled ? "6px 16px" : "8px 20px",
          border: `1px solid ${headerStyles.borderColor}`,
          boxShadow: headerStyles.boxShadow,
          backdropFilter: headerStyles.backdropFilter,
          WebkitBackdropFilter: headerStyles.WebkitBackdropFilter,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src={logo}
              alt="Lilith"
              className="h-8 md:h-10 transition-all duration-300"
              style={{
                filter: scrolled ? "none" : "drop-shadow(0 0 20px rgba(255,91,170,0.15))",
              }}
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {mainNavItems.map((item) => (
              <div
                key={item.path}
                className="relative"
                onMouseEnter={() => handleDropdownEnter(item.path)}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  to={item.path}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 flex items-center ${
                    isActive(item.path)
                      ? "bg-accent-primary/10 text-accent-primary"
                      : scrolled
                      ? "text-text-secondary hover:text-text-primary hover:bg-white/5"
                      : "text-text-secondary/70 hover:text-text-primary hover:bg-white/5"
                  }`}
                >
                  {item.name}
                  {item.dropdown && <span className="mr-1 text-[10px] opacity-50">▾</span>}
                </Link>

                <AnimatePresence>
                  {activeDropdown === item.path && item.dropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-full right-0 mt-1 rounded-xl p-1.5 w-56 overflow-y-auto shadow-xl"
                      style={{
                        backgroundColor: "rgba(11,8,24,0.95)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div className="flex flex-col gap-0.5">
                        {item.dropdown.map((sub) => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors duration-150 ${
                              isActive(sub.path)
                                ? "bg-accent-primary/10 text-accent-primary"
                                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter("services")}
              onMouseLeave={handleDropdownLeave}
            >

              <AnimatePresence>
                {activeDropdown === "services" && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-full right-0 mt-1 rounded-xl p-1.5 w-70 overflow-y-auto shadow-xl"
                    style={{
                      backgroundColor: "rgba(11,8,24,0.95)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="grid grid-cols-2 gap-0.5">
                      {pathsMap.map((path) => (
                        <Link
                          key={path.path}
                          to={path.path}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors duration-150 ${
                            isActive(path.path)
                              ? "bg-accent-primary/10 text-accent-primary"
                              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                          }`}
                        >
                          {path.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/Discounts"
              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                isActive("/Discounts")
                  ? "bg-accent-primary/10 text-accent-primary"
                  : scrolled
                  ? "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  : "text-text-secondary/70 hover:text-text-primary hover:bg-white/5"
              }`}
            >
              تخفیفات
            </Link>
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <button
            onClick={() => setSearch(true)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                scrolled
                  ? "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  : "text-text-secondary/70 hover:text-text-primary hover:bg-white/5"
              }`}
              aria-label="جستجو"
            >
              <FaSearch size={16} />
            </button>

            <Link
              to={token ? "/Dashboard" : "/Login"}
              className={`hidden sm:block px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                token
                  ? "bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20"
                  : "bg-accent-primary text-white hover:bg-accent-primary/90"
              }`}
            >
              {token ? (
                <span className="flex items-center gap-2">
                  <FaUser size={12} />
                  {user?.firstname || "داشبورد"}
                </span>
              ) : (
                "ورود | ثبت نام"
              )}
            </Link>

            <button
              onClick={() => setSideMenu(true)}
              className={`lg:hidden p-2 rounded-lg transition-colors duration-200 ${
                scrolled
                  ? "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  : "text-text-secondary/70 hover:text-text-primary hover:bg-white/5"
              }`}
              aria-label="منو"
            >
              <GiHamburgerMenu size={20} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {sideMenu && (
          <>
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
              className="lg:hidden fixed top-0 right-0 h-screen w-[85%] max-w-sm p-5 overflow-y-auto z-[999]"
              style={{
                backgroundColor: "rgba(11,8,24,0.97)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderLeft: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <img src={logo} alt="Lilith" className="h-8" />
                  <span className="text-lg font-bold gradient-text">Lilith</span>
                </div>
                <button
                  onClick={() => setSideMenu(false)}
                  className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                  aria-label="بستن"
                >
                  <IoMdClose size={22} />
                </button>
              </div>

              {token && user && (
                <div className="rounded-xl p-3 mb-5 flex items-center gap-3" style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div className="w-9 h-9 rounded-full bg-accent-primary/20 flex items-center justify-center">
                    <FaUser className="text-accent-primary" size={14} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-text-primary">{user.firstname} {user.lastname}</p>
                    <p className="text-xs text-text-secondary">{user.phone}</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-1">
                <Link
                  to="/"
                  onClick={() => setSideMenu(false)}
                  className="px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors flex items-center justify-between text-sm"
                >
                  خانه
                  <IoMdArrowForward className="text-xs opacity-40" />
                </Link>

                <Link
                  to="/Discounts"
                  onClick={() => setSideMenu(false)}
                  className="px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors flex items-center justify-between text-sm"
                >
                  تخفیفات
                  <IoMdArrowForward className="text-xs opacity-40" />
                </Link>

                <div className="h-px my-2" style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                }} />

                <p className="px-3 py-1 text-xs font-medium text-text-secondary/50">خدمات</p>

                {[...mainNavItems, ...pathsMap].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSideMenu(false)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                      isActive(item.path)
                        ? "bg-accent-primary/10 text-accent-primary"
                        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="h-px my-2" style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                }} />

                <Link
                  to={token ? "/Dashboard" : "/Login"}
                  onClick={() => setSideMenu(false)}
                  className={`px-3 py-2.5 text-center font-medium rounded-lg transition-all duration-300 text-sm ${
                    token
                      ? "bg-white/5 text-text-primary hover:bg-white/10"
                      : "bg-accent-primary text-white hover:bg-accent-primary/90"
                  }`}
                >
                  {token ? "داشبورد" : "ورود | ثبت نام"}
                </Link>

                {token && (
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.reload();
                    }}
                    className="px-3 py-2.5 text-center text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                  >
                    خروج
                  </button>
                )}
              </nav>
            </motion.aside>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm"
              onClick={() => setSideMenu(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;