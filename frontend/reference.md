<div className="relative flex items-center justify-center flex-wrap max-w-screen min-h-screen w-full overflow-hidden bg-gray-50 z-[1]">
            <div className='h-full w-full absolute z-[-1] bg-gradient-to-br from-gray-50 to-emerald-600/10 blur-3xl'>
            </div>
            {/* Abstract 3D Background (Framer-like) */}
            <div className="px-4 py-10 flex md:flex-row flex-col items-center justify-between ">

                <div className="h-full w-full flex items-center justify-center p-4">
                    <div className="relative z-[-1] w-full max-w-2xl aspect-square  "> {/* Container with aspect ratio */}
                        {/* Main brain image */}
                        <div className="bg-gray-200/10 rounded-full overflow-hidden h-full w-full ">
                            <img
                                className="bg-blend-color object-cover  h-full w-full "
                                src={brain}
                                alt="Brain illustration"
                            />
                        </div>

                        {/* Study pointer */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 group pointer-events-auto">
                            <div className="relative">
                                <img
                                    className="rounded-full h-16 w-16 md:h-20 md:w-20 border-1 border-sky-500/20 shadow-lg transform group-hover:scale-110 transition-all duration-300 CustPoint animate-float "
                                    src={study}
                                    alt="Study icon"
                                />
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black text-white p-2 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-48 text-sm">
                                    Study materials and resources
                                    <div className="absolute -top-2 left-1/2 w-4 h-4 bg-white transform -translate-x-1/2 rotate-45"></div>
                                </div>
                            </div>
                            {/* <div className="absolute top-16 left-1/2 w-1 h-16 bg-gray-400 transform -translate-x-1/2 origin-top -scale-y-100"></div> */}
                        </div>

                        {/* Research pointer */}
                        <div className="absolute bottom-2 right-8 group pointer-events-auto">
                            <div className="relative">
                                <img
                                    className="rounded-full h-16 w-16 md:h-20 md:w-20 border-1 border-sky-500/20 shadow-lg transform group-hover:scale-110 transition-all duration-300 cursor-pointer animate-float-delay "
                                    src={research}
                                    alt="Research icon"
                                />
                                <div className="absolute top-1/2 right-full transform -translate-y-1/2 mr-2 bg-black text-white p-2 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity w-48 text-sm duration-300" >
                                    Research findings and data
                                    <div className="absolute top-1/2 left-full w-4 h-4 bg-white transform -translate-y-1/2 rotate-45"></div>
                                </div>
                            </div>
                            {/* <div className="absolute top-1/2 right-16 w-16 h-1 bg-gray-400 transform -translate-y-1/2"></div> */}
                        </div>
                    </div>
                </div>
                <section className="text-center flex items-center justify-center flex-col gap-2">
                    <h1 className="space-grotesk text-4xl md:text-5xl lg:text-7xl font-bold text-center text-gray-800 md:text-black">The Open source , <span className="cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-black/90 to-purple-700/90">Community</span> driven , Custom knowledge based agent</h1>
                    <h2 className="bai-jamjuree-light text-xs md:text-lg text-center text-gray-500 ">With the help of <Link to="/Interface" className='text-transparent bg-clip-text bg-gradient-to-r from-black/90 to-purple-700/90 font-bold '>AntiNode</Link> anyone can obtain information about any topic based on the data uploaded and verified by community members , making information access and sharing much easier and faster .</h2>
                    {/* cta button */}
                    <motion.ul whileHover={{ scale: 1.05, transform: "translateX(50px)" }} transition={{ duration: 0.6 }} whileTap={{ scale: 1.09 }}>
                        <Link
                            to="/Interface" className=' p-3  overflow-x-hidden  rounded-lg bg-black text-white space-grotesk flex items-center justify-center gap-2 mt-10 CustPoint     transition-all duration-500 '>Get Started <ul  ><FiArrowUpRight className='' /></ul></Link>
                    </motion.ul>


                </section>

            </div>



        </div>
