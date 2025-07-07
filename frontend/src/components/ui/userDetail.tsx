import React from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaRegFile } from "react-icons/fa";
import { useRef } from "react";
import { motion } from 'framer-motion'
// declaring props type
type FormProps = {
    shhowUserForm: boolean;
    setShowUserForm: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedFile?: React.Dispatch<React.SetStateAction<File | null>>;
    selectedFile?: File | null;
    handleUpload?: (UserData: FormData) => void;
    loading: boolean
};

const UserForm: React.FC<FormProps> = ({ shhowUserForm, setShowUserForm, setSelectedFile, handleUpload, loading }) => {

    const [name, SetName] = React.useState<string>('');
    const [email, setEmail] = React.useState<string>('');
    const [feedback, setFeedback] = React.useState<string>('');

    // const feeback = { name: name, email: email, feedback: feedback }


    // top-10 right-2  md:right-50
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (<>
        <div className={` absolute top-5 md:right-25  right-8 z-[1] space-grotesk w-[90%] md:w-fit`}>
            <label onClick={() => setShowUserForm(!shhowUserForm)} className="cursor-pointer  text-sm flex items-center justify-center gap-1 " htmlFor="Category">Contribution Info <IoMdArrowDropdown size={24} className={`transition-all duration-300  ${shhowUserForm === true ? "rotate-90" : "rotate-0"} `} /></label>
            <section className={`${shhowUserForm ? "h-auto opacity-100 py-5 px-4" : "h-0 opacity-0 py-0 px-0"} bg-gradient-to-br from-gray-50 to-gray-100 text-black font-sm   overflow-hidden transition-all duration-300 rounded-lg mt-3 flex items-start justify-start  flex-col border border-black/40  gap-3 relative z-[1] `}>
                <div className="flex items-start justify-start gap-3 flex-col" >
                    <label className="text-sm md:text-md font-bold" htmlFor="Name">Name</label>
                    <input onChange={(e) => {
                        SetName(e.target.value)
                    }} value={name} className="border text-sm border-gray-500 rounded-lg px-2 py-1   font-normal" type="text" placeholder="Your Name" />
                </div>
                <div className="flex items-start justify-start gap-3 flex-col">
                    <label className="text-sm md:text-md font-bold" htmlFor="Email">Email</label>
                    <input onChange={(e) => {
                        setEmail(e.target.value)
                    }} value={email} className="border border-gray-500 rounded-lg px-2 py-1 text-sm font-normal" type="text" placeholder="Your email address" />
                </div>
                <div className="flex items-start justify-start gap-3 flex-col">
                    <label className="text-sm md:text-md font-bold" htmlFor="Feeback">Any Feeback</label>
                    <textarea onChange={(e) => {
                        setFeedback(e.target.value)
                    }} value={feedback} className="border text-sm py-1 border-gray-500 rounded-lg px-2 font-normal w-full" placeholder="Anything you want to share with others " rows={4} />
                </div>
                <div className="flex items-start justify-start gap-1 flex-col ">
                    <label className="flex items-center justify-center gap-3 font-bold" htmlFor="file">Choose your file
                        <ul onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full bg-gray-400 hover:bg-gray-400 transition-all duration-300 cursor-pointer z-[1] hover:shadow-sm shadow-black">
                            <FaRegFile className="hover:rotate-z-10 transition-all duration-300 " />
                        </ul>
                    </label>

                    <input onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setSelectedFile?.(file); // Optional chaining
                        // console.log(file);
                    }} ref={fileInputRef} className="font-normal text-xs " type="file" />

                </div>
                <motion.button onClick={() => {
                    const UserData = new FormData();
                    if (!name || !email || !feedback) {
                        alert("Please fill all the fields");
                        return;
                    }

                    UserData.append('name', name);
                    UserData.append('email', email);
                    UserData.append('feedback', feedback);


                    handleUpload?.(UserData)

                }} disabled={loading === true} whileDrag={{ scale: 2 }} whileTap={{ scale: 1.09, boxShadow: "2px 2px 2px gray" }}
                    className="bg-black text-white rounded-xl px-2 py-1 self-end text-sm  cursor-pointer hover:rotate-3 transition-all duration-300 z-[1] bai-jamjuree-regular">{loading === true ? "Uploading" : "Upload"}</motion.button>

            </section>
        </div>

    </>
    );
}

export default UserForm;