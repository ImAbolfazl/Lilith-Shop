import { Outlet } from "react-router";
import Header from "../components/Header";

export default function BlankLayout() {
    return (
        <>
            <Header/>
            <Outlet />
        </>
    );
}