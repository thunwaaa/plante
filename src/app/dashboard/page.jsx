'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { plantApi, API_URL } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { requestNotificationPermission } from '@/lib/notification'

const page = () => {
  const router = useRouter()
  const [plants, setPlants] = useState([]);
  const [openDialog, setOpenDialog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshPlants = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log("No authenticated user found");
        throw new Error("No authenticated user");
      }

      // Get fresh token
      const idToken = await currentUser.getIdToken(true);
      console.log("Got fresh token for plants request");

      // First verify token with backend
      const verifyResponse = await fetch("http://localhost:8080/auth/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        console.error("Token verification failed:", errorData);
        throw new Error(errorData.error || "Token verification failed");
      }

      const verifyData = await verifyResponse.json();
      console.log("Token verified successfully:", verifyData);

      // Check verification status
      const checkResponse = await fetch("http://localhost:8080/auth/check-verification", {
        headers: {
          "Authorization": `Bearer ${idToken}`,
        },
      });

      if (!checkResponse.ok) {
        const errorData = await checkResponse.json();
        console.error("Verification check failed:", errorData);
        throw new Error(errorData.error || "Verification check failed");
      }

      const checkData = await checkResponse.json();
      console.log("Verification status:", checkData);

      if (!checkData.is_verified) {
        console.log("User not verified, redirecting to verification page");
        router.push("/verify-email");
        return;
      }

      // Now fetch plants with the verified token
      const plantsResponse = await fetch("http://localhost:8080/api/plants/dashboard", {
        headers: {
          "Authorization": `Bearer ${idToken}`,
        },
      });

      if (!plantsResponse.ok) {
        const errorData = await plantsResponse.json();
        console.error("Failed to fetch plants:", errorData);
        throw new Error(errorData.error || "Failed to fetch plants");
      }

      const plantsData = await plantsResponse.json();
      console.log("Plants fetched successfully:", plantsData);
      setPlants(plantsData);
      setError(null);
    } catch (error) {
      console.error("Error in refreshPlants:", error);
      setError(error.message);
      
      if (error.message === "No authenticated user" || 
          error.message.includes("Token") || 
          error.message.includes("Unauthorized")) {
        // Clear session and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login?error=session_expired");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe;
    
    const checkAuth = async () => {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log("Auth state changed - User is signed in:", user.uid);
          try {
            // Get fresh token
            const idToken = await user.getIdToken(true);
            console.log("Got fresh token on auth state change");
            
            // Store token
            localStorage.setItem("token", idToken);
            
            // Request notification permission and save FCM token if not already granted
            if (typeof window !== 'undefined' && Notification && Notification.permission !== 'granted') {
              try {
                await requestNotificationPermission();
                console.log('FCM token requested and sent to backend');
              } catch (err) {
                console.warn('FCM token not saved:', err);
              }
            }

            // Refresh plants
            await refreshPlants();
          } catch (error) {
            console.error("Error in auth state change:", error);
            setError(error.message);
          }
        } else {
          console.log("Auth state changed - No user");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
        }
      }, (error) => {
        console.error("Auth state change error:", error);
        setError(error.message);
      });
    };

    checkAuth();

    // Cleanup subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router]);

  const goToNewPage = () => {
    router.push('/dashboard/new')
  }

  const handleDelete = async (plantId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/plants/${plantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        throw new Error(`Failed to delete plant: ${response.statusText}`);
      }

      setPlants(plants.filter(plant => plant._id !== plantId));
      setOpenDialog(null);
    } catch (err) {
      console.error('Error deleting plant:', err);
      if (err.message.includes('401') || 
          err.message.includes('unauthorized') || 
          err.message.includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      setError('Failed to delete plant. Please try again.');
    }
  }

  const handleEdit = (plantId) => {
    router.push(`/dashboard/edit/${plantId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#373E11]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={refreshPlants}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
      <h1 className='sm:text-3xl md:text-4xl text-3xl  font-extrabold flex justify-center mt-12'>ต้นไม้ของคุณ</h1>

      { plants.length === 0 ? (
        <div className="flex justify-center mt-8">
          <button
            onClick={goToNewPage}
            className='flex justify-center items-center max-sm:w-80 md:w-3xl lg:w-7xl border m-4 p-12 rounded-3xl opacity-85 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-95'
          >
            <Plus className="w-12 h-12 md:w-18 md:h-18 lg:w-20 lg:h-20 opacity-55" />
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-6 mt-8 mx-3">
          {openDialog !== null && (
            <Dialog open={true} onOpenChange={() => setOpenDialog(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>คุณแน่ใจหรือไม่ว่าจะลบต้นไม้นี้?</DialogTitle>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(null)}>
                    ยกเลิก
                  </Button>
                  <Button
                    className="bg-red-600 text-white"
                    onClick={() => handleDelete(openDialog)}
                  >
                    ลบ
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {plants.map((plant) => (
            <div key={plant._id} className="p-4 border rounded-xl w-64 shadow-md bg-[#E6E4BB] relative">
              <div className="h-40 w-full shadow-sm rounded-md overflow-hidden mb-2 flex justify-center items-center">
                {plant.image_url && (
                  <img
                    src={plant.image_url}
                    alt={plant.name}
                    className="w-full h-40 object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/400x400?text=Plant+Image';
                    }}
                    key={`${plant._id}-${plant.image_url}`}
                  />
                )}
              </div>
              <h2 className="text-xl font-bold">{plant.name}</h2>
              <p>ประเภท: {plant.type}</p>
              <p>ความสูง: {plant.plant_height} cm</p>
              <p>วันที่ปลูก: {format(new Date(plant.plant_date), 'dd/MM/yyyy')}</p>
              <p>ภาชนะ: {plant.container}</p>

              <div className="flex justify-end mt-4 gap-2">
                <button onClick={() => handleEdit(plant._id)} className="hover:text-blue-800 mr-4">
                  <Pencil size={20} />
                </button>
                <button onClick={() => setOpenDialog(plant._id)} className="hover:text-red-800">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={goToNewPage}
            className="p-4 border rounded-xl w-64 h-96 shadow-md flex flex-col justify-center items-center bg-[#E6E4BB] hover:scale-105 transition"
          >
            <Plus className="w-12 h-12 opacity-55" />
            <span className="mt-2 font-semibold">เพิ่มต้นไม้</span>
          </button>
        </div>
      )}
    </>
  )
}

export default page