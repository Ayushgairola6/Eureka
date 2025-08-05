const Tutorial = () => {
    return (<>
        <div className=" relative flex items-center justify-evenly p flex-col md:flex-row gap-5 ">
            {/* accent bg-gradient */}
            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-br from-pink-600/20 to-purple-600/20 blur-3xl">
            </div>
            {/* main content */}
            <div className=" w-80 top-0 left-0 p-6 flex items-center justify-center rotate-45 rounded-br-full rounded-tr-full border border-purple-600">
                <div className=" rounded-lg  h-50 md:h-60 lg:h-80 w-full  -rotate-45  ">

                    <img className="h-full w-full rounded-lg" src="user2.jpg" alt="video" />

                </div>
            </div>

            <div>
                <h1 className="text-2xl md:text-6xl bai-jamjuree-bold font-bold">Eureka Tutorial</h1>
                <h2 className="text-xl md:text-4xl bai-jamjuree-semibold font-semibold">Beginners Guide</h2>
            </div >

        </div>
    </>)
}

export default Tutorial;