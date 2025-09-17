
import { useEffect, useState } from "react";

const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME;

export default function ProductCards() {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");

  const getRecordId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("recordId");
  };

  useEffect(() => {
    const recordId = getRecordId();
    if (!recordId) {
      setError("No recordId found in URL. Please check your link.");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${recordId}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          },
        });

        if (!response.ok) {
          let errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error) {
              errorText = `Airtable API Error: ${errorData.error.type} - ${errorData.error.message}`;
            }
          } catch {}
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        setProduct(data.fields);
        if (data.fields.product_images?.length > 0) {
          setMainImage(data.fields.product_images[0].url);
        }
      } catch (err) {
        console.error(err);
        setError(`Could not fetch product data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="p-6 rounded-xl bg-white shadow-md">
          Loading product data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="max-w-xl p-6 rounded-xl bg-red-100 border border-red-400 text-red-700 font-semibold text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto my-8 p-6 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col md:flex-row gap-8">
      {/* Left: Images */}
      <div className="flex-1 flex flex-col items-center">
        <img
          src={mainImage || "https://via.placeholder.com/400x300?text=No+Image"}
          alt={product?.product_name || "Product"}
          className="w-full max-w-md h-auto max-h-96 rounded-lg border border-gray-200 object-contain"
        />
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {product?.product_images?.map((img, idx) => (
            <img
              key={idx}
              src={img.url}
              alt={`thumb-${idx}`}
              onClick={() => setMainImage(img.url)}
              className="w-16 h-16 object-cover rounded-md border border-gray-300 cursor-pointer hover:scale-105 transition"
            />
          ))}
        </div>
      </div>

      {/* Right: Details */}
      <div className="flex-1 flex flex-col">
        <div>
          <h2 className="font-poppins text-2xl font-semibold text-slate-900">
            {product?.product_name || "N/A"}
          </h2>
          <p className="text-slate-600 mt-2">
            {product?.description || "No description available."}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Product Cost
            </div>
            <div className="text-lg font-semibold text-slate-900 mt-1">
              ${Number(product?.cost_price || 0).toFixed(2)}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Selling Price
            </div>
            <div className="text-lg font-semibold text-slate-900 mt-1">
              ${Number(product?.selling_price || 0).toFixed(2)}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Profit per Sale
            </div>
            <div className="text-lg font-semibold text-slate-900 mt-1">
              ${Number(product?.profit_per_sale || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-auto">
          <a
            href="https://www.aliexpress.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-lg bg-white text-slate-800 font-semibold hover:bg-gray-50 hover:-translate-y-0.5 transition"
          >
            <img
              src="https://download.logo.wine/logo/AliExpress/AliExpress-Logo.wine.png"
              alt="AliExpress"
              className="h-6"
            />
            AliExpress
          </a>
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-lg bg-white text-slate-800 font-semibold hover:bg-gray-50 hover:-translate-y-0.5 transition"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
              alt="Amazon"
              className="h-5"
            />
            Amazon
          </a>
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-lg bg-white text-slate-800 font-semibold hover:bg-gray-50 hover:-translate-y-0.5 transition"
          >
            <img
              src="https://i.pinimg.com/736x/4a/4c/22/4a4c224a0c6667178bebdfa3b6bdb92b.jpg"
              alt="Facebook Ads"
              className="h-6"
            />
            Facebook Ads
          </a>
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-lg bg-white text-slate-800 font-semibold hover:bg-gray-50 hover:-translate-y-0.5 transition"
          >
            Find best supplier
          </a>
        </div>
      </div>
    </div>
  );
}
