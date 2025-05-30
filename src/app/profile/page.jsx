'use client'
import { React, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link';
import { Pencil, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

function ProfilePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        created_at: "",
        updated_at: "",
        user_id: "",
        profileImageUrl: ""
    });

    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                // Get user ID from token
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                // Decode token to get user ID
                const tokenParts = token.split('.');
                if (tokenParts.length !== 3) {
                    throw new Error('Invalid token format');
                }

                const payload = JSON.parse(atob(tokenParts[1]));
                const userId = payload.user_id;

                const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!res.ok) {
                    if (res.status === 401) {
                        // If unauthorized, redirect to login
                        router.push('/login');
                        return;
                    }
                    throw new Error("Failed to fetch profile");
                }

                const data = await res.json();
                setProfile(data);
            } catch (error) {
                console.error("Error fetching profile: ", error);
                setError(error.message);
                toast.error("Failed to load profile data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#373E11]" />
                <span className="ml-2 text-lg">Loading profile...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Error: {error}</p>
                    <Button onClick={() => router.push('/login')} className="bg-[#373E11] text-[#E6E4BB]">
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    // Format date to a readable string
    const formatDate = (dateString) => {
        if (!dateString) return "Not available";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-[#E6E4BB] py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="rounded-lg border shadow-lg p-6">
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative w-32 h-32 mb-4">
                            <Avatar className="w-32 h-32">
                                <AvatarImage src={profile?.profileImageUrl || "/profile.jpg"} alt={profile?.name || "User"}/>
                                <AvatarFallback>{profile?.name ? profile.name.charAt(0).toUpperCase() : 'CN'}</AvatarFallback>
                            </Avatar>
                        </div>
                        <h1 className="text-2xl font-bold text-[#373E11] mt-2 underline">{profile.name || "User"}</h1>
                    </div>


                    <div className="space-y-4 grid justify-center text-center">
                        <div>
                            <label className="block text-xl font-medium">Email</label>
                            <p className="mt-1 text-lg">{profile.email}</p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <Link href="/profile/edit">
                            <Button className="bg-[#373E11] text-[#E6E4BB] hover:bg-[#454b28] px-6 py-2 rounded-lg flex items-center">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;