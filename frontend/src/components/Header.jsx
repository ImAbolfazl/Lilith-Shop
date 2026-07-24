import React, { useContext, useState } from "react";
import { Link } from "react-router";
import logo from "../assets/logo.png";
import { IoMdClose } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaMoon, FaSearch } from "react-icons/fa";
import { MdSunny } from "react-icons/md";
import { UserContext } from "../App";
import Search from "./search.jsx";
import { AnimatePresence, motion } from "framer-motion";

// Soft underline using your accent color
const Underline = ({ children }) => (
    <motion.span className="relative cursor-pointer text-text-primary" whileHover="hover">
        {children}
        <motion.span
            variants={{
                hover: { width: "100%" },
                initial: { width: 0 }
            }}
            initial="initial"
            transition={{ duration: 0.25 }}
            className="absolute left-0 -bottom-1 h-[2px] bg-accent-primary/80"
        />
    </motion.span>
);

// Soft glow wrapper using your accent color
const Glow = ({ children }) => (
    <div className="text-text-primary drop-shadow-[0_0_6px_var(--color-accent-primary)]">
        {children}
    </div>
);

const Header = ({ theme, setTheme }) => {
    const [sideMenu, setSideMenu] = useState(false);
    const [search, setSearch] = useState(false);
    const { token } = useContext(UserContext);

    const pathsMap = [
        { name: "وورلد اف وارکرفت", path: "/Products?c=WoW" },
        { name: "دیسکورد", path: "/Products?c=Discord" },
        { name: "تلگرام", path: "/Products?c=Telegram" },
        { name: "کیک", path: "/Products?c=Kick" },
        { name: "اپیک گیمز", path: "/Products?c=EpicGames" },
        { name: "توییج", path: "/Products?c=Twitch" },
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

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const toggleSearch = () => setSearch(!search);

    return (
        <motion.div
            key={theme}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-around h-20 fixed top-0 left-0 right-0 z-100
      bg-bg-secondary/60 backdrop-blur-xl border-b border-accent-primary/20
      shadow-[0_0_15px_var(--color-accent-primary)]"
        >
            <AnimatePresence>
                {search && <Search toggleSearch={toggleSearch} />}
            </AnimatePresence>

            <motion.div
                whileHover={{ rotateY: 15, rotateX: 8, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
                <Link to="/">
                    <img
                        src={logo}
                        alt="Lilith"
                        className="h-20 drop-shadow-[0_0_10px_var(--color-accent-primary)]"
                    />
                </Link>
            </motion.div>

            <div className="flex gap-10 text-xl xl:text-2xl max-lg:hidden">
                {[
                    { name: "خدمات استیم", path: "/Products?c=Steam" },
                    { name: "خدمات ماینکرفت", path: "/Products?c=MineCraft" },
                    { name: "خدمات کالاف دیوتی", path: "/Products?c=CallOfDuty" },
                ].map((item) => (
                    <motion.div
                        key={item.path}
                        whileHover={{ scale: 1.12, x: 3 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                        <Underline>
                            <Link to={item.path}>{item.name}</Link>
                        </Underline>
                    </motion.div>
                ))}

                <motion.div className="relative group pb-1" whileHover={{ scale: 1.12 }}>
                    <Underline>
                        <Link to="/Products?c=All">سایر خدمات</Link>
                    </Underline>

                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="absolute top-full left-0 invisible opacity-0 group-hover:visible group-hover:opacity-100
            bg-bg-secondary/95 backdrop-blur-xl p-5 rounded-2xl
            grid grid-cols-3 gap-3 w-200"
                    >
                        {pathsMap.map((path) => (
                            <motion.div key={path.path} whileHover={{ scale: 1.08 }}>
                                <Link to={path.path}>{path.name}</Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            <motion.div
                whileHover={{ scale: 1.12 }}
                className="bg-bg-secondary hover:bg-accent-primary/20 duration-300 px-6 py-2 rounded-3xl
        border border-accent-primary cursor-pointer hidden lg:block"
            >
                <Glow>
                    {token ? (
                        <Link to="/Dashboard" className="text-xl xl:text-1xl">
                            داشبورد
                        </Link>
                    ) : (
                        <Link to="/Login" className="text-xl xl:text-1xl">
                            ورود | ثبت نام
                        </Link>
                    )}
                </Glow>
            </motion.div>

            <div className="flex items-center gap-10">
                <FaSearch
                    size={30}
                    onClick={toggleSearch}
                    className="cursor-pointer hidden lg:block text-text-primary drop-shadow-[0_0_6px_var(--color-accent-primary)]"
                />

                <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: theme === "light" ? 180 : 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {theme === "light" ? (
                        <MdSunny
                            className="size-8 cursor-pointer hidden lg:block text-accent-primary drop-shadow-[0_0_6px_var(--color-accent-primary)]"
                            onClick={toggleTheme}
                        />
                    ) : (
                        <FaMoon
                            className="size-8 cursor-pointer hidden lg:block text-accent-primary drop-shadow-[0_0_6px_var(--color-accent-primary)]"
                            onClick={toggleTheme}
                        />
                    )}
                </motion.div>
            </div>

            <GiHamburgerMenu
                className="lg:hidden size-10 cursor-pointer text-text-primary drop-shadow-[0_0_6px_var(--color-accent-primary)]"
                onClick={() => setSideMenu(true)}
            />

            <AnimatePresence>
                {sideMenu && (
                    <>
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.3 }}
                            className="lg:hidden flex flex-col absolute bg-bg-secondary/70 backdrop-blur-xl p-10
              left-0 top-0 h-screen gap-4 items-center w-70 z-999
              shadow-[0_0_15px_var(--color-accent-primary)]"
                        >
                            <div className="flex items-center justify-center gap-10 mb-8">
                                <FaSearch
                                    onClick={() => {
                                        toggleSearch();
                                        setSideMenu(false);
                                    }}
                                    className="size-6 cursor-pointer text-text-primary drop-shadow-[0_0_6px_var(--color-accent-primary)]"
                                />
                                <IoMdClose
                                    className="size-10 cursor-pointer text-accent-secondary drop-shadow-[0_0_6px_var(--color-accent-secondary)]"
                                    onClick={() => setSideMenu(false)}
                                />
                                {theme === "light" ? (
                                    <MdSunny
                                        className="size-8 cursor-pointer text-accent-primary drop-shadow-[0_0_6px_var(--color-accent-primary)]"
                                        onClick={toggleTheme}
                                    />
                                ) : (
                                    <FaMoon
                                        className="size-8 cursor-pointer text-accent-primary drop-shadow-[0_0_6px_var(--color-accent-primary)]"
                                        onClick={toggleTheme}
                                    />
                                )}
                            </div>

                            {token ? (
                                <Glow>
                                    <Link
                                        onClick={() => setSideMenu(false)}
                                        to="/Dashboard"
                                        className="text-3xl mb-4"
                                    >
                                        داشبورد
                                    </Link>
                                </Glow>
                            ) : (
                                <Glow>
                                    <Link
                                        onClick={() => setSideMenu(false)}
                                        to="/Login"
                                        className="text-3xl mb-4 flex items-center gap-5"
                                    >
                                        <p>ورود</p>
                                        <p>|</p>
                                        <p>ثبت نام</p>
                                    </Link>
                                </Glow>
                            )}

                            {[
                                { name: "خدمات استیم", path: "/Products?c=Steam" },
                                { name: "خدمات ماینکرفت", path: "/Products?c=MineCraft" },
                                { name: "خدمات کالاف دیوتی", path: "/Products?c=CallOfDuty" },
                                ...pathsMap,
                            ].map((item) => (
                                <Glow key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={() => setSideMenu(false)}
                                        className="text-xl"
                                    >
                                        {item.name}
                                    </Link>
                                </Glow>
                            ))}
                        </motion.div>

                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black/70 h-screen w-screen z-998"
                            onClick={() => setSideMenu(false)}
                        />
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Header;
