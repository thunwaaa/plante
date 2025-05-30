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
import Link from 'next/link';

const edit = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        profileImageUrl: ""
    });

    const [profileImage, setProfileImage] = useState(null); 
    const [imagePreview, setImagePreview] = useState('/profilePic.jpg');
    const [imageInputRef, setImageInputRef] = useState(null);
    const [password,setPassword] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/auth/profile", {
                    method: "GET",
                    credentials: "include",
                });
                if (!res.ok) {
                    console.log("Failed to fetch profile");
                    return;
                }

                const data = await res.json();
                setProfile(data);
                if (data.profileImageUrl) {
                    setImagePreview(data.profileImageUrl);
                }
            } catch (error) {
                console.error("Error fetching profile: ", error);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value,
        }));
    };

    const uploadToCloudinary = async (file) => {
        if (!file) {
            throw new Error("No file selected for upload");
        }
    
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "ml_default");
        return toast.promise(
            fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            ).then((res) => {
                if (!res.ok) {
                    return res.json().then((error) => {
                        throw new Error(error.error.message || "Failed to upload image");
                    });
                }
                return res.json();
            }).then((data) => {
                return data.secure_url;
            }),
            {
                loading: 'Uploading Profile...',
                success: 'Profile Upload Success!',
                error: 'Upload Profile Error'
            }
        );
    };
    
    
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const validateProfile = () => {
        const requiredFields = [
            { name: 'firstname', label: 'firstname' },
            { name: 'lastname', label: 'lastname' },
            { name: 'gender', label: 'gender' },
            { name: 'phone', label: 'phone' }
        ];

        for (let field of requiredFields) {
            if (!profile[field.name] || profile[field.name].trim() === '') {
                toast.error(`Please fill the ${field.label}`);
                return false;
            }
        }
        return true;
    };

    const toggleProfile = async () => {
        if (isEditing) {
            if (!validateProfile()) {
                return;
            }

            try {
                let imageUrl = profile.profileImageUrl;
                if (profileImage) {
                    imageUrl = await uploadToCloudinary(profileImage);
                }
                const res = await fetch("http://localhost:8080/api/auth/edit-profile", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        ...profile,
                        profileImageUrl: imageUrl,
                    }),
                });
                if (res.ok) {
                    const updatedProfile = await res.json();
                    setProfile(updatedProfile);
                    toast.success("Update Profile Sucessfully!",{
                        duration:2000,
                    });
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    if (updatedProfile.profileImageUrl) {
                        setImagePreview(updatedProfile.profileImageUrl);
                    }
                    console.log("Profile updated successfully");
                }
            } catch (error) {
                console.error("Error updating profile: ", error);
            }
        }
        setIsEditing(!isEditing);
    };

    const triggerImageUpload = () => {
        if (isEditing && imageInputRef) {
            imageInputRef.click();
        }
    };

    const deleteuser = async () => {
        if (!password) {
            toast.error("Please enter your password");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/auth/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ password }),
                credentials: "include",
            });

            if (res.ok) {
                toast.success("Delete Account successfully!");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                setIsDeleteDialogOpen(false);
                router.push("/");
            } else {
                toast.error("Invalid password");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete account");
        }
    };
  return (
    <div className='border flex items-center justify-center mt-4 mx-12'>
        <div className='w-full h-full border grid my-8 mx-4'>
            <div className='m-6 grid p-4'>
                <label htmlFor="Name" className='mb-2'>
                    Name
                </label>
                <input
                    id='name' 
                    type="text" 
                    value={profile.name}
                    onChange={handleChange}
                    readOnly
                    className="border rounded-lg p-1"
                />
                <label htmlFor="email" className='my-2'>Email</label>
                <input
                    id='email' 
                    type="email" 
                    value={profile.email}
                    onChange={handleChange}
                    className="border rounded-lg p-1"
                    readOnly
                />
            </div>
            <div className='flex justify-center'>
                <Link href='/profile/edit'>
                    <button className='border rounded-lg w-28 p-1 bg-[#373E11] text-[#E6E4BB]'>
                        Edit Profile
                    </button>
                </Link>
            </div>
        </div>
    </div>
  )
}

export default edit