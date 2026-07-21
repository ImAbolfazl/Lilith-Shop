import { Outlet } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout({ theme, setTheme }) {
    return (
        <>
            <Header theme={theme} setTheme={setTheme} />
            <Outlet />
            <Footer />
        </>
    );
}