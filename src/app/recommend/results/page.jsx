'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

const ResultsPage = () => {
  const searchParams = useSearchParams();
  const [recommendedPlants, setRecommendedPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Get all search parameters
        const params = new URLSearchParams();
        const area = searchParams.get('area');
        const light = searchParams.get('light');
        const size = searchParams.get('size');
        const water = searchParams.get('water');
        const purpose = searchParams.get('purpose');
        const experience = searchParams.get('experience');

        // Add parameters to URL if they exist
        if (area) params.append('area', area);
        if (light) params.append('light', light);
        if (size) params.append('size', size);
        if (water) params.append('water', water);
        if (purpose) params.append('purpose', purpose);
        if (experience) params.append('experience', experience);

        // Fetch recommendations from the API - use the backend URL
        const response = await fetch(`http://localhost:8080/api/recommendations?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        setRecommendedPlants(data.plants || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [searchParams]); // Rerun effect when searchParams change

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#373E11] mx-auto"></div>
          <p className="mt-4 text-lg">กำลังค้นหาพืชที่เหมาะสม...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <div className="text-red-600 mb-4">เกิดข้อผิดพลาดในการค้นหา: {error}</div>
        <button
          onClick={() => router.push('/recommend')}
          className="bg-[#373E11] text-white px-4 py-2 rounded-md hover:bg-[#454b28] transition-colors"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className='text-3xl md:text-4xl font-bold text-center m-3 mt-8'>พืชที่เหมาะสมกับคุณ</h1>
      <p className='text-center'>{recommendedPlants.length} ต้นที่ตรงกับเงื่อนไขของคุณ</p>

      {recommendedPlants.length > 0 && (
        <div className="text-center my-2 flex justify-center">
          <button
            onClick={() => router.push('/recommend')}
            className="bg-[#373E11] text-white px-4 py-2 rounded-md hover:bg-[#454b28] transition-colors delay-75 duration-100 ease-in-out hover:-translate-y-1 hover:scale-110"
          >
            ค้นหาใหม่
          </button>
        </div>
      )}

      {recommendedPlants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-6 ">
          {recommendedPlants.map(plant => (
            <div key={plant.id} className="bg-[#E6E4BB] border rounded-lg p-4 shadow-md flex flex-col transition delay-75 duration-100 ease-in-out hover:-translate-y-1 hover:scale-110">
              <div className="w-full aspect-[3/2] bg-[#E6E4BB] rounded-md mb-4 overflow-hidden flex items-center justify-center">
                {plant.image ? (
                  <img 
                    src={plant.image} 
                    alt={plant.name} 
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-plant.png';
                    }}
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <h2 className="text-xl font-bold mb-2 underline">{plant.name}</h2>
              <p className="text-sm mb-4 flex-grow ">{plant.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>❤️ {plant.careLevel}</p>
                <p>☀️ {plant.conditions.แสง.join(', ')}</p>
                <p>💧 {plant.conditions.Water}</p>
                <p>⚓ {plant.conditions.ขนาด}</p>
              </div>
              <div className="mt-4">
                {plant.tags.map(tag => (
                  <span key={tag} className="border inline-block bg-[#373E11] rounded-full px-3 py-1 text-sm font-semibold text-[#E6E4BB] mr-2 mb-2 ">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center mt-8">
          <p className="mb-4">ไม่พบพืชที่ตรงกับเงื่อนไข</p>
          <button
            onClick={() => router.push('/recommend')}
            className="bg-[#373E11] text-white px-4 py-2 rounded-md hover:bg-[#454b28] transition-colors"
          >
            ลองค้นหาใหม่
          </button>
        </div>
      )}

    </>
  );
};

export default ResultsPage; 