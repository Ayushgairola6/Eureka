
import { MdClose } from "react-icons/md"
import { useAppSelector } from "../store/hooks.tsx";

type PrivateDocProps = {
    showDocs: boolean
    setShowDocs: React.Dispatch<React.SetStateAction<boolean>>
    selectedDoc: string
    setSelectedDoc: React.Dispatch<React.SetStateAction<string>>
}

const PrivateDocuments: React.FC<PrivateDocProps> = ({ showDocs, setShowDocs, selectedDoc, setSelectedDoc }) => {
    // ${showDocs ? "h-full w-full opacity-100" : "h-0 w-0 opacity-0 overflow-hidden"
    //             }
    const privateDocs = useAppSelector((state) => state.auth.documents)
    return (
        <div className={`absolute h-full w-full md:w-1/2 p-2 top-0 left-0 z-[1] space-grotesk bg-black/90  transition-all duration-500 ${showDocs?"translate-x-0":"-translate-x-[100%]"}`}>
            {/* cancel icon at topright */}
            <ul onClick={() => setShowDocs(!showDocs)} className="absolute top-3 right-3 CustPoint">
                <MdClose color="red" size={22} />
            </ul>

            {/* private documents of the user */}
            <div className="text-white flex items-normal justify-center gap-3 h-full  p-4">
                {privateDocs && privateDocs.length > 0 ? (
                    privateDocs.map((doc) => (
                        <div onClick={() => {
                            if (selectedDoc === doc.document_id) {
                                setSelectedDoc("")
                            } else {
                                setSelectedDoc(doc?.document_id)
                            }
                        }} className={` p-2 text-xs  border ${selectedDoc === doc.document_id ? "border-green-400 bg-black" : "border-black bg-gray-50 text-black"} rounded-lg  h-20 w-fit CustPoint overflow-scroll`} key={doc.id} >
                            <h3 className="font-bold">Document Title -
                                <ul className="text-sky-500 font-normal">{doc.feedback}</ul></h3>
                            <ul className="text-green-500">
                                Document ID - {doc.document_id}
                            </ul>

                            <p className="text-red-500">Uploaded at: {doc.created_at.split("T")[0]}</p>
                        </div>
                    ))
                ) : (
                    <span className="space-grotesk text-center flex items-center justify-center "><ul>Oops! No docs</ul></span>
                )}
            </div>
        </div>
    );
}

export default PrivateDocuments;