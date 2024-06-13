import React, { useState } from 'react';
import axios from 'axios';
import './css/font.css';
import Header from './header';
import Footer from './footer';
import html2pdf from 'html2pdf.js';
import CreatableSelect from 'react-select/creatable';
import Loader from './components/loader';

function App() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [format, setFormat] = useState('code128');
  const [unit, setUnit] = useState('10001');
  const [prodCode, setProdCode] = useState('');
  const [barcodeData, setBarcodeData] = useState(null);
  const [apiData, setApiData] = useState([]);
  const [barcodeCount, setBarcodeCount] = useState(0);
  const [selectedDaNo, setSelectedDaNo] = useState(null);
  const [daNoOptions, setDaNoOptions] = useState([]);
  const [productCodeOptions, setProductCodeOptions] = useState([]);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [descriptionOptions, setDescriptionOptions] = useState([]);
  const [storeCode, setStoreCode] = useState('');  // Add storeCode state

  const refresh = () => {
    setText('');
    setFormat('code128');
    setUnit('10001');
    setProdCode('');
    setBarcodeData(null);
    setApiData([]);
    setBarcodeCount(0);
    setSelectedDaNo(null);
    setSelectedDescription(null);
    setDaNoOptions([]);
    setProductCodeOptions([]);
    setDescriptionOptions([]);
    setStoreCode('');  
   
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedProduct = apiData.find(item => item.PRODUCT_CODE === prodCode);
      if (selectedProduct) {
        const { BARCODE_NO, DESCRIPTION, QTY, STORE_CODE } = selectedProduct; 
        const barcodeResponse = await axios.post('http://192.168.0.250:5000/api/barcode/generate', { text: BARCODE_NO, format });
        setBarcodeData(barcodeResponse.data);

        setBarcodeCount(QTY);
        setText(BARCODE_NO);
        setSelectedDescription(DESCRIPTION);
        setStoreCode(STORE_CODE);  
      }
    } catch (error) {
      console.error('Error generating barcode or fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBarcodeCount = (data, daNo) => {
    if (data && data.length > 0) {
      const filteredData = data.filter(item => item.DA_NO === daNo);
      setBarcodeCount(filteredData.reduce((total, item) => total + item.QTY, 0));
      const productCodes = [...new Set(filteredData.map(item => item.PRODUCT_CODE))];
      const productCodeOptions = productCodes.map(code => ({ value: code, label: code }));
      setProductCodeOptions(productCodeOptions);

      const descriptions = [...new Set(filteredData.map(item => item.DESCRIPTION))];
      const descriptionOptions = descriptions.map(desc => ({ value: desc, label: desc }));
      setDescriptionOptions(descriptionOptions);
    } else {
      setBarcodeCount(0);
      setProductCodeOptions([]);
      setDescriptionOptions([]);
    }
  };

  const handleDaNoChange = async (selectedOption) => {
    setLoading(true);
    setSelectedDaNo(selectedOption);
    try {
      const apiUrl = `http://192.168.0.250:5000/api/data?unit=${unit}&daNo=${selectedOption.value || selectedOption}`;
      const apiResponse = await axios.get(apiUrl);
      setApiData(apiResponse.data);
      updateBarcodeCount(apiResponse.data, selectedOption?.value || selectedOption);
      if (apiResponse.data[0]) {
        setProdCode(apiResponse.data[0].PRODUCT_CODE || '');
        setSelectedDescription(apiResponse.data[0].DESCRIPTION || '');
        setStoreCode(apiResponse.data[0].STORE_CODE || '');  // Set storeCode
      } else {
        console.error('BARCODE_NO or PRODUCT_CODE not found in the API response');
      }
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProdCodeChange = async (selectedOption) => {
    const selectedProductCode = selectedOption.value;
    setProdCode(selectedProductCode);
    const selectedProduct = apiData.find(item => item.PRODUCT_CODE === selectedProductCode);
    if (selectedProduct) {
      setText(selectedProduct.BARCODE_NO || '');
      setSelectedDescription(selectedProduct.DESCRIPTION || '');
      setBarcodeCount(selectedProduct.QTY || 0);
      setStoreCode(selectedProduct.STORE_CODE || '');  // Set storeCode
    }
  };

  const handleDescriptionChange = async (selectedOption) => {
    const selectedDescriptionValue = selectedOption.value;
    setSelectedDescription(selectedDescriptionValue);
    const selectedProduct = apiData.find(item => item.DESCRIPTION === selectedDescriptionValue);
    if (selectedProduct) {
      setText(selectedProduct.BARCODE_NO || '');
      setProdCode(selectedProduct.PRODUCT_CODE || '');
      setBarcodeCount(selectedProduct.QTY || 0);
      setStoreCode(selectedProduct.STORE_CODE || '');  // Set storeCode
    }
  };

  const generatePdf = () => {
    const opt = {
      margin: 0,
      filename: 'barcodes.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'px', format: [359, 132 * 3], orientation: 'portrait' }, // Assuming you want 3 stickers per page
    };

    html2pdf().set(opt).from(document.getElementById('barcodes-container')).save();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-6xl flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full md:w-1/2">
            <div className="flex justify-between mb-2">
              <h2 className="text-2xl text-gray font-bold dark:text-gray">Search Barcode</h2>
              <button onClick={refresh} className="flex items-center px-4 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-indigo-600 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-80">
                <svg className="w-5 h-5 mx-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span className="mx-1">Refresh</span>
              </button>
            </div>
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
                  <label className="block text-gray-700 font-bold mb-2">DA No:</label>
                  <CreatableSelect
                    value={selectedDaNo}
                    onChange={handleDaNoChange}
                    options={daNoOptions}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Prod Code:</label>
                  <CreatableSelect
                    value={{ value: prodCode, label: prodCode }}
                    onChange={handleProdCodeChange}
                    options={productCodeOptions}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 font-bold mb-2">Description:</label>
                <CreatableSelect
                  value={{ value: selectedDescription, label: selectedDescription }}
                  onChange={handleDescriptionChange}
                  options={descriptionOptions}
                  className="w-full" isDisabled
                />
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 font-bold mb-2">BarCode No.:</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled
                />
              </div>
              <div className="mt-2 text-gray-700 font-bold">
                Number of Barcodes: {barcodeCount}
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 mt-4"
              >
                Generate Barcode
              </button>
            </form>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg w-full md:w-1/2">
            <h2 className="text-2xl mb-2 text-gray font-bold dark:text-gray">Preview</h2>
            {barcodeData && (
              <div id="barcodes-container">
                {Array.from({ length: barcodeCount }, (_, i) => (
                  <div key={i} className="label-card">
                    <div className="label-content">
                      <div className="label-description">{selectedDescription}</div>
                      <div className="label-description">{storeCode}</div>
                      <img src={`data:image/png;base64,${barcodeData.pngBase64}`} alt="Generated Barcode" className="label-barcode" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {apiData && (
              <button
                onClick={generatePdf}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300 mt-2"
              >
                Print
              </button>
            )}
          </div>
        </div>
      </main>
      {loading && <Loader />}
      <Footer />
    </div>
  );
}

export default App;
