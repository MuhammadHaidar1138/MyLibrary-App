import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function Template() {
    return (
        <div className="flex h-screen">
            <div className="flex-none">
                <Sidebar />
            </div>

            <div className="flex-1 p-8 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
}