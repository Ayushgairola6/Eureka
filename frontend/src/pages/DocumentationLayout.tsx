import React from "react";
import { Link, Outlet } from "react-router";

type DocLayoutProps = {
  children?: React.ReactNode;
};

const DocumentationLayout: React.FC<DocLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-normal justify-between bg-white dark:bg-black relative overflow-hidden ">
      {/* <div className="absolute top-0 left-0 bg-gradient-to-br from-indigo-600/20 to-red-600/20 dark:from-black dark:to-black blur-3xl h-full w-full"></div> */}
      {/* Sidebar */}
      <aside className="min-h-screen  left-0 top-0 hidden md:flex flex-col gap-4 w-100 p-6   shadow-lg   bg-black/10 text-black dark:text-white dark:bg-white/10 border-r dark:border-gray-400  space-grotesk">
        <Link
          to="/Api/introduction"
          className="transition-colors hover:bg-white hover:text-black duration-300 rounded px-3 py-2 "
        >
          Introduction
        </Link>
        <Link
          to="/Api/AntiNode/Know-How"
          className="transition-colors hover:bg-white hover:text-black duration-300 rounded px-3 py-2 "
        >
          How AntiNode works
        </Link>
        <Link
          to="/Api/AntiNodeManagaging-PrivateDocs"
          className="transition-colors hover:bg-white hover:text-black duration-300 rounded px-3 py-2 "
        >
          Private documents
        </Link>
        <Link
          to="/Api/AntiNodeGettingAllDocuments"
          className="transition-colors hover:bg-white hover:text-black duration-300 rounded px-3 py-2 "
        >
          Get Document
        </Link>
        <Link
          to="/Api/AntiNodeQueryIng-Documents"
          className="transition-colors hover:bg-white hover:text-black duration-300 rounded px-3 py-2 "
        >
          Query Documents
        </Link>
        <Link
          to="/Api/AntiNodeUploading_Documents"
          className="transition-colors hover:bg-white hover:text-black duration-300 rounded px-3 py-2 "
        >
          Using the API
        </Link>
      </aside>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 blur-3xl z-[-1]" />
      {/* Main Content */}
      {/* <main className=" px-4 pt-2"> */}
      {children || <Outlet />} {/* Render either children or Outlet */}
      {/* </main> */}
    </div>
  );
};

export default DocumentationLayout;
