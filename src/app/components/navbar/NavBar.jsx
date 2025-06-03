"use client"
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger
} from "@/components/ui/menubar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import Link from "next/link";
import { X, Menu, ChevronUp, ChevronDown, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { initializeNotifications } from '@/lib/notification';

const components = [
  { title: "แจ้งเตือนการรดน้ำ", href: "/reminder" },
  { title: "แนะนำพืชที่เหมาะสมกับสภาพแวดล้อม", href: "/recommend" },
  { title: "วิเคราะห์ปัญหาต้นไม้", href: "/diagnosis" },
  { title: "สมุดจดบันทึกต้นไม้", href: "/diary" },
];

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isServicesOpen, setIsServicesOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState(null);
  
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = React.useCallback(async () => {
    try {
      // Sign out from Firebase first
      await auth.signOut();
      console.log("NavBar: User signed out from Firebase");
      
      // Clear tokens and state
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setIsLoggedIn(false);
      setUserProfile(null);
      
      // Dispatch logout event for other components
      window.dispatchEvent(new Event('logout'));
      
      // Redirect to home page if not already there
      if (pathname !== '/') {
        router.push('/');
      }
    } catch (error) {
      console.error("NavBar: Error during logout:", error);
      toast.error("Error during logout. Please try again.");
    }
  }, [pathname, router]);

  const handleNavigation = React.useCallback((path) => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      router.push(path);
    }
  }, [isLoggedIn, router]);

  // Check login status on component mount and listen for login events
  React.useEffect(() => {
    setMounted(true);
    
    let isSubscribed = true; // Flag to prevent state updates after unmount
    
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isSubscribed) return; // Don't update state if component is unmounted
      
      console.log("NavBar: Auth state changed, user:", user ? "exists" : "null");
      
      if (user) {
        console.log("NavBar: User signed in:", user.uid);
        if (isSubscribed) setIsLoggedIn(true);
        
        try {
          // Get fresh token
          const idToken = await user.getIdToken(true);
          console.log("NavBar: Got fresh token");
          
          if (!isSubscribed) return; // Check again before updating state
          
          // Store token
          localStorage.setItem("token", idToken);
          
          // Initialize notifications after successful login
          try {
            await initializeNotifications();
            console.log("NavBar: Notifications initialized");
          } catch (error) {
            console.error("NavBar: Failed to initialize notifications:", error);
          }
          
          // Fetch user profile
          const res = await fetch(`http://localhost:8080/api/profile`, {
            method: "GET",
            credentials: "include",
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
          
          if (!isSubscribed) return; // Check again before updating state
          
          if (res.ok) {
            const data = await res.json();
            console.log("NavBar: Profile fetched successfully");
            if (isSubscribed) {
              setUserProfile(data.user);
            }
          } else {
            console.error("NavBar: Failed to fetch user profile");
            if (isSubscribed) {
              toast.error("Failed to load user profile.");
              setIsLoggedIn(false);
              setUserProfile(null);
            }
          }
        } catch (error) {
          console.error("NavBar: Error in auth state change:", error);
          if (isSubscribed) {
            toast.error("Error loading user profile.");
            setIsLoggedIn(false);
            setUserProfile(null);
          }
        }
      } else {
        console.log("NavBar: No user signed in, clearing state");
        if (isSubscribed) {
          setIsLoggedIn(false);
          setUserProfile(null);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      }
    });

    // Cleanup subscription
    return () => {
      console.log("NavBar: Cleaning up auth state listener");
      isSubscribed = false; // Prevent state updates after unmount
      unsubscribe();
    };
  }, [pathname]); // Add pathname as dependency since it's used in the component

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) setIsServicesOpen(false);
  };

  const toggleServices = () => {
    setIsServicesOpen(!isServicesOpen);
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <>
      <div className="border-b border-[#373E11] h-24 flex items-center sticky top-0 bg-[#E6E4BB] z-40">
        <div className="flex items-center justify-between w-full px-4 py-2">
          {/* Hamburger Menu (Mobile) */}
          <div className="hidden max-md:block">
            <button onClick={toggleMenu} className="flex items-center p-2 transition-all duration-300">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link 
              href={isLoggedIn ? '/dashboard' : '/login'} 
              className="cursor-pointer"
            >
              <img src="/plantelogo.svg" alt="logo" className="h-12 w-auto" />
            </Link>
          </div>

          {/* Navigation Menu (Desktop) */}
          <div className="max-md:hidden">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-4">
                <NavigationMenuItem>
                  <Link 
                    href={isLoggedIn ? '/dashboard' : '/login'} 
                    className={cn(navigationMenuTriggerStyle(), "text-xl")}
                  >
                    Home
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-xl">Services</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="flex flex-col items-center md:w-[280px]">
                      {components.map((component) => (
                        <ListItem 
                          key={component.title} 
                          title={component.title} 
                          href={isLoggedIn ? component.href : '/login'} 
                        />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link 
                    href="/about" 
                    className={cn(navigationMenuTriggerStyle(), "text-xl")}
                  >
                    About
                  </Link>         
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-6">
            {isLoggedIn ? (
              <button 
                onClick={handleLogout} 
                className="items-center gap-2 w-full py-2 px-4 flex justify-end text-right hover:bg-red-700 hover:text-white transition-colors rounded-md bg-[#373E11] text-[#E6E4BB]"
              >
                <LogOut size={20}/>
                Log out
              </button>
            ) : (
              <div className="flex gap-4">
                <Link href="/login" className="px-4 py-2 text-[#373E11] hover:text-[#454b28] transition-colors border rounded-lg">
                  Login
                </Link>
                <Link href="/signup" className="px-4 py-2 bg-[#373E11] text-[#E6E4BB] rounded-lg hover:bg-[#454b28] transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden fixed top-24 left-0 right-0 bg-[#E6E4BB] z-30 border-[#373E11] shadow-md"
          >
            <div className="flex flex-col items-center border-b gap-4 p-4">
              <Link 
                href={isLoggedIn ? '/dashboard' : '/login'} 
                className="text-xl py-2 w-full text-center border-[#373E11] hover:text-[#E6E4BB] hover:bg-[#373E11]"
              >
                Home
              </Link>
              <div className="relative w-full">
                <button 
                  className="text-xl py-2 w-full text-center border-[#373E11] flex items-center justify-center hover:text-[#E6E4BB] hover:bg-[#373E11]"
                  onClick={toggleServices}
                >
                  Services
                  {isServicesOpen ? <ChevronUp className="ml-2 h-5 w-5" /> : <ChevronDown className="ml-2 h-5 w-5" />}
                </button>

                {/* Services Dropdown Content (Mobile) */}
                <AnimatePresence>
                  {isServicesOpen && (
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="w-full py-2 origin-top bg-[#E6E4BB] shadow-md border border-[#373E11]"
                      style={{ transformOrigin: "top" }}
                    >
                      <ul className="flex flex-col items-center w-full">
                        {components.map((component) => (
                          <li key={component.title} className="w-full">
                            <Link 
                              href={isLoggedIn ? component.href : '/login'}
                              className="py-3 px-4 block w-full text-center text-[16px] hover:bg-[#373E11] hover:text-white transition-colors"
                            >
                              {component.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link 
                href="/" 
                className="text-xl py-2 w-full text-center border-[#373E11] hover:text-[#E6E4BB] hover:bg-[#373E11]"
              >
                About
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default NavBar;

const ListItem = React.forwardRef(({
  className,
  title,
  href,
  ...props
}, ref) => {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "select-none space-y-1 rounded-md p-4 leading-none no-underline outline-none transition-colors min-h-[60px] flex items-center justify-center text-[18px] text-center font-normal hover:bg-[#373E11] hover:text-white w-full",
          className
        )}
        {...props}
      >
        {title}
      </Link>
    </li>
  );
});

ListItem.displayName = "ListItem";
