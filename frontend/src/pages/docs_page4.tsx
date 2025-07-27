import { Link } from "react-router"
import { FaCode, FaLock, FaKey, FaRocket } from 'react-icons/fa';
import { FiTool, FiArrowRight } from 'react-icons/fi';

const API_functions = () => {
    return (<div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 p-8 w-full flex flex-col items-center gap-8 hover:shadow-2xl transition-shadow duration-300">
        {/* Header Section */}
        <div className="text-center space-y-3 w-full">
            <h1 className="text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">
                Eureka SDK
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Programmatic access to your <span className="font-semibold text-blue-600">private knowledge base</span> with just a few lines of code
            </p>
            <div className="flex justify-center gap-2">
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <FaCode className="w-3 h-3" />
                    Developer Friendly
                </span>
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <FaLock className="w-3 h-3" />
                    End-to-End Secure
                </span>
            </div>
        </div>

        {/* Installation */}
        <div className="w-full p-5 bg-gray-50 rounded-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FiTool className="w-5 h-5 text-blue-600" />
                Installation
            </h2>
            <div className="mt-3 bg-gray-800 rounded-lg p-4 overflow-x-auto">
                <pre className="text-gray-100 text-sm font-mono">
                    <code>npm install eurekaV1</code>
                </pre>
            </div>
        </div>

        {/* SDK Features */}
        <div className="w-full space-y-6">
            {/* Feature 1: List Documents */}
            <div className="p-5 hover:bg-gray-50/50 rounded-xl transition-all duration-200 border border-gray-100 hover:border-blue-200">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            List Your Documents
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Retrieve metadata for all your private documents including IDs, titles, upload dates and processing status.
                        </p>

                        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-mono text-gray-500 mb-2">JavaScript Example</h3>
                            <pre className="text-sm bg-gray-800 rounded-md p-3 overflow-x-auto text-gray-100">
                                {`import Eureka from 'eureka-rag-sdk';

const eureka = new Eureka('YOUR_API_KEY');
const documents = await eureka.listDocuments();

// Returns:
// {
//   documents: [
//     {
//       id: 'doc_123',
//       title: 'Research Paper.pdf',
//       uploadDate: '2023-11-15',
//       status: 'processed',
//       size: '2.4MB'
//     },
//     ...
//   ]
// }`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature 2: Query Document */}
            <div className="p-5 hover:bg-gray-50/50 rounded-xl transition-all duration-200 border border-gray-100 hover:border-emerald-200">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <span className="text-emerald-600 font-bold">2</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Query Documents
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Get AI-powered answers from your private documents by providing a document ID and your question.
                        </p>

                        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-mono text-gray-500 mb-2">JavaScript Example</h3>
                            <pre className="text-sm bg-gray-800 rounded-md p-3 overflow-x-auto text-gray-100">
                                {`const response = await eureka.queryDocument({
  documentId: 'doc_123', 
  question: 'What were the key findings?'
});

// Returns:
// {
//   answer: 'The study found three significant...',
//   confidence: 0.92,
//   sources: [{
//     page: 12,
//     text: 'As shown in Figure 3...'
//   }]
// }`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature 3: Upload Documents */}
            <div className="p-5 hover:bg-gray-50/50 rounded-xl transition-all duration-200 border border-gray-100 hover:border-purple-200">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Upload Documents
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Programmatically upload documents to your private knowledge base with automatic processing.
                        </p>

                        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-mono text-gray-500 mb-2">JavaScript Example</h3>
                            <pre className="text-sm bg-gray-800 rounded-md p-3 overflow-x-auto text-gray-100">
                                {`const result = await eureka.uploadDocument({
  file: '/path/to/document.pdf',
  title: 'Annual Report 2023',
  visibility: 'private', // optional (default)
  tags: ['finance', 'annual'] // optional
});

// Returns:
// {
//   id: 'doc_456',
//   status: 'processing',
//   estimatedWait: 30 // seconds
// }`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Authentication Info */}
        <div className="w-full mt-6 p-5 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaKey className="w-5 h-5 text-blue-600" />
                Authentication
            </h3>
            <p className="mt-2 text-gray-600">
                All SDK methods require your API key. Get one from the <Link to="/API/featured" className="text-blue-600 hover:underline">API dashboard</Link>.
            </p>
        </div>

        {/* CTA */}
        <div className="w-full mt-8 text-center">
            <Link
                to="/API/featured"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-400/30 transition-all duration-300 inline-flex items-center gap-2"
            >
                <FaRocket className="w-5 h-5" />
                Get Your API Key
                <FiArrowRight className="w-4 h-4" />
            </Link>
        </div>
    </div>
    )
}

export default API_functions