import React, { useState } from 'react';
import axios from 'axios';
import './css/font.css'
import Header from './header';
import Footer from './footer';
import html2pdf from 'html2pdf.js';

function App() {
  const [text, setText] = useState('');
  const [format, setFormat] = useState('code128');
  const [unit, setUnit] = useState('10001');
  const [doc, setDoc] = useState('');
  const [prodCode, setProdCode] = useState('');
  const [barcodeData, setBarcodeData] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [barcodeCount, setBarcodeCount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const barcodeResponse = await axios.post('http://localhost:5000/api/barcode/generate', { text, format });
      setBarcodeData(barcodeResponse.data);
      const apiResponse = await axios.get(`http://localhost:5000/api/data?unit=${unit}&doc=${doc}&prodCode=${prodCode}`);
      setApiData(apiResponse.data);
      setBarcodeCount(apiResponse.data.length);
    } catch (error) {
      console.error('Error generating barcode or fetching data', error);
    }
  };

  const handleFetchData = async () => {
    try {
      const apiResponse = await axios.get(`http://localhost:5000/api/data?unit=${unit}&doc=${doc}&prodCode=${prodCode}`);
      console.log('API Response:', apiResponse.data); // Debug log
      setApiData(apiResponse.data);
      setBarcodeCount(apiResponse.data.length);
      if (apiResponse.data[0].BARCODE_NO) {
        setText(apiResponse.data[0].BARCODE_NO);
      } else {
        console.error('BARCODE_NO not found in the API response');
      }
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  // const handleDownload = () => {
  //   const url = window.URL.createObjectURL(new Blob([Uint8Array.from(atob(barcodeData.pdfBase64), (c) => c.charCodeAt(0))]));
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'barcode.pdf';
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // };

  const generatePdf = () => {
    const opt = {
      margin: 1,
      filename: 'barcodes.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(document.getElementById('barcodes-container')).save();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-6xl flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full md:w-1/2">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Unit:</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="10001">10001</option>
                    <option value="10002">10002</option>
                  </select>
                </div>
                <div>
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
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Prod Code:</label>
                  <input
                    type="text"
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Doc:</label>
                  <input
                    type="text"
                    value={doc}
                    onChange={(e) => setDoc(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 font-bold mb-2">Text:</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled
                />
              </div>
              <div className="mt-2 text-gray-700 font-bold">
                Number of Barcodes: {barcodeCount}
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 mt-4"
              >
                Generate Barcode and Fetch Data
              </button>
            </form>
            <button
              onClick={handleFetchData}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 mt-2"
            >
              Fetch Data
            </button>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg w-full md:w-1/2">
            {barcodeData && (
              <div id="barcodes-container">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex">
                  {Array.from({ length: 2 }, (_, j) => (
                    <div key={j + i * 2} className="m-2">
                      <div style={{ width: '172px', height: '133px', border: '1px solid #000', padding: '10px', boxSizing: 'border-box' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '5px',fontFamily: 'DIN, sans-serif' }}>{apiData[i * 2 + j]?.DESCRIPTION}</div>
                        <div style={{ fontSize: '10px', marginBottom: '5px',fontFamily: 'DIN, sans-serif' }}>{apiData[i * 2 + j]?.STORE_CODE}</div>
                        <img src={`data:image/png;base64,${barcodeData.pngBase64}`} alt="Generated Barcode" style={{ height: '45.354330709px', width: '139.84251969px' }} className="barcode-def" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            )}
            {apiData && (
              <div className="mt-4">
                {/* <pre className="bg-gray-100 p-4 rounded-lg">{JSON.stringify(apiData, null, 2)}</pre> */}
              </div>
            )}
            <button
              onClick={generatePdf}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300 mt-2"
            >
              Generate PDF
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;