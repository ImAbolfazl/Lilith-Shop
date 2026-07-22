import { Outlet } from "react-router";
import Header from "../components/Header";

export default function BlankLayout({theme, setTheme}) {
    return (
        <>
            <Header theme={theme} setTheme={setTheme} />
            <Outlet />
        </>
    );
}