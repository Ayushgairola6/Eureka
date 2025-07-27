import React from "react";
import { Link, Outlet } from "react-router";  // Changed from "react-router" to "react-router-dom"
import { Toaster } from "sonner";

type DocLayoutProps = {
    children?: React.ReactNode;  // Made children optional
};

const DocumentationLayout: React.FC<DocLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex items-center justify-evenly bg-white relative overflow-hidden">
            {/* Sidebar */}
            <aside className="absolute left-0 top-0 hidden md:flex flex-col gap-4 w-64 p-6   shadow-lg  h-full bg-black/80 text-white space-grotesk">
                <Link to='/API/featured' className="transition-colors hover:bg-white hover:text-black duration-300 rounded px-3 py-2 ">Introduction</Link>
                <Link to='/docs/page2' className="transition-colors hover:bg-white hover:text-black duration-300 rounded px-3 py-2 ">How Eureka works</Link>
                <Link to='/docs/page3' className="transition-colors hover:bg-white hover:text-black duration-300 rounded px-3 py-2 ">Private documents</Link>
                <Link to='/docs/page4' className="transition-colors hover:bg-white hover:text-black duration-300 rounded px-3 py-2 ">Using the API</Link>
            </aside>

            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 blur-3xl z-[-1]" />

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10 max-w-4xl w-full">
                <Toaster />
                {children || <Outlet />}  {/* Render either children or Outlet */}
            </main>
        </div>
    );
};

export default DocumentationLayout;