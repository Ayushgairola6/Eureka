import React from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaRegFile } from "react-icons/fa";
import { useRef } from "react";
import { motion } from 'framer-motion'
import { Toaster ,toast} from "sonner";
// declaring props type
type FormProps = {
    shhowUserForm: boolean;
    setShowUserForm: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedFile?: React.Dispatch<React.SetStateAction<File | null>>;
    selectedFile?: File | null;
    handleUpload?: (UserData: FormData) => void;
    loading: boolean,
    setVisibility: React.Dispatch<React.SetStateAction<string>>
};

const UserForm: React.FC<FormProps> = ({ shhowUserForm, setShowUserForm, setSelectedFile, handleUpload, loading, setVisibility }) => {

    const [name, SetName] = React.useState<string>('');
    const [feedback, setFeedback] = React.useState<string>('');


    // top-10 right-2  md:right-50
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (<>
        <div className={` z-[1] space-grotesk`}>
            <label onClick={() => setShowUserForm(!shhowUserForm)} className="CustPoint  text-sm flex items-center justify-center gap-1 " htmlFor="Category">Contribution <IoMdArrowDropdown size={24} className={`transition-all duration-300  ${shhowUserForm === true ? "rotate-90" : "rotate-0"} `} /></label>
            <section className={`${shhowUserForm ? "h-auto  py-4 flex items-center justify-center gap-2 opacity-100   overflow-y-auto px-3" : "h-0 opacity-0 py-0 px-0"} bg-gradient-to-br from-gray-50 to-gray-100 text-black    overflow-hidden transition-all duration-500 rounded-lg  flex items-start justify-center gap-1  flex-col border border-black/40 relative `}>
                <div className="flex items-start justify-start gap-3 flex-col" >
                    <label className="text-sm md:text-md font-bold" htmlFor="Name">Name</label>
                    <input onChange={(e) => {
                        SetName(e.target.value)
                    }} value={name} className="border text-sm border-gray-500 rounded-lg px-2 py-1   font-normal" type="text" placeholder="Your Name" />
                </div>
                <div className="flex items-start justify-start gap-3 flex-col">
                    <label className="text-sm md:text-md font-bold" htmlFor="Feeback">A title or description</label>
                    <textarea onChange={(e) => {
                        setFeedback(e.target.value)
                    }} value={feedback} className="border text-sm py-1 border-gray-500 rounded-lg px-2 font-normal w-full" placeholder="Anything related to this document " rows={4} />
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
                <div className="flex items-start justify-start gap-3 flex-col">
                    <label className="text-sm md:text-md font-bold" htmlFor="Visibility">Visibility type</label>
                    <section className="flex items-center justify-center gap-3">
                        <span className="flex items-center justify-center gap-2">
                            <input value="Public" onChange={(e) => setVisibility(e.target.value)} name="visibility" type="radio" />
                            <label htmlFor="visibility">Public</label>
                        </span>
                        <span className="flex items-center justify-center gap-2">
                            <input value="Private" onChange={(e) => setVisibility(e.target.value)} name="visibility" type="radio" />
                            <label htmlFor="visibility">Private</label>
                        </span>
                    </section>

                </div>
                <motion.button onClick={() => {
                    const UserData = new FormData();
                    if (!name || !feedback) {
                        toast("Please fill in all fields")
                        return;
                    }

                    UserData.append('name', name);
                    UserData.append('feedback', feedback);
                    handleUpload?.(UserData)

                }} disabled={loading === true} whileDrag={{ scale: 2 }} whileTap={{ scale: 1.09, boxShadow: "2px 2px 2px gray" }}
                    className="bg-black text-white rounded-xl px-3 py-2 self-end text-sm  cursor-pointer hover:rotate-3 transition-all duration-300 z-[1] bai-jamjuree-regular">{loading === true ? "Contributing" : "Contribute"}</motion.button>

            </section>
            <Toaster />
        </div>

    </>
    );
}

export default UserForm;