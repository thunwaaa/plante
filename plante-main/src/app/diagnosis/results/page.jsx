'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DiagnosisResultsPage() {
  const router = useRouter();
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get the diagnosis data from the previous page
    const storedDiagnosis = sessionStorage.getItem('diagnosisData');
    if (storedDiagnosis) {
      setDiagnosis(JSON.parse(storedDiagnosis));
      sessionStorage.removeItem('diagnosisData'); // Clear the stored data
    } else {
      setError('No diagnosis data found. Please try again.');
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg">Loading diagnosis results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto rounded-lg shadow-md p-6">
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
          <button
            onClick={() => router.push('/diagnosis')}
            className="mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            Back to Diagnosis Form
          </button>
        </div>
      </div>
    );
  }

  if (!diagnosis) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">ผลการวิเคราะห์อาการต้นไม้</h1>
      
      <div className="max-w-2xl mx-auto border rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl underline font-semibold mb-4">การวินิจฉัย</h2>
            <p className="text-lg">{diagnosis.diagnosis}</p>
          </div>

          <div>
            <h2 className="text-2xl underline font-semibold mb-4">วิธีแก้ไข</h2>
            <p className="text-lg">{diagnosis.solution}</p>
          </div>

          <div>
            <h2 className="text-2xl underline font-semibold mb-4">ระดับความรุนแรง</h2>
            <div className={`inline-block px-4 py-2 rounded-lg ${
              diagnosis.severity === 'สูง' ? 'bg-red-100 text-red-700' :
              diagnosis.severity === 'กลาง' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              <p className={`text-lg font-medium`}>
                {diagnosis.severity === 'สูง' ? 'รุนแรง (สูง)' :
                 diagnosis.severity === 'กลาง' ? 'ปานกลาง' :
                 'ไม่รุนแรง (ต่ำ)'}
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => router.push('/diagnosis')}
              className="w-full bg-[#373E11] text-[#E6E4BB] py-3 px-4 rounded-xl hover:bg-[#454b28] transition-colors"
            >
              กลับไปหน้าวิเคราะห์
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 