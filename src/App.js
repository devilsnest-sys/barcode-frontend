import React, { useState } from 'react';
import axios from 'axios';
import Header from './header';
import Footer from './footer';

function App() {
    const [text, setText] = useState('');
    const [format, setFormat] = useState('code128');
    const [pdfBlob, setPdfBlob] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/barcode/generate', { text, format }, {
                responseType: 'blob'
            });

            setPdfBlob(response.data);
        } catch (error) {
            console.error('Error generating barcode', error);
        }
    };

    const handleDownload = () => {
        const url = window.URL.createObjectURL(new Blob([pdfBlob]));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'barcode.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2">Text:</label>
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2">Format:</label>
                            <select
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="code128">Code 128</option>
                                <option value="qrcode">QR Code</option>
                                <option value="ean13">EAN-13</option>
                                <option value="upca">UPC-A</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                        >
                            Generate Barcode
                        </button>
                    </form>
                    {pdfBlob && (
                        <div className="mt-4">
                            <button
                                onClick={handleDownload}
                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300"
                            >
                                Download PDF
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default App;
