"use client"
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { X, Menu, ChevronUp, ChevronDown, LogOut } from "lucide-react";

const components = [
  { title: "แจ้งเตือนการรดน้ำ", href: "/" },
  { title: "แนะนำพืชที่เหมาะสมกับสภาพแวดล้อม", href: "/recommend" },
  { title: "วิเคราะห์ปัญหาต้นไม้", href: "/diagnosis" },
  { title: "สมุดจดบันทึกต้นไม้", href: "/diary" },
];

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isServicesOpen, setIsServicesOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check login status on component mount and listen for login events
  React.useEffect(() => {
    setMounted(true);
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    // Check initial login status
    checkLoginStatus();

    // Listen for login events
    window.addEventListener('login', checkLoginStatus);

    // Cleanup
    return () => {
      window.removeEventListener('login', checkLoginStatus);
    };
  }, []);

  const handleNavigation = (path) => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      router.push(path);
    }
  };

  if (pathname === "/login" || pathname === "/signup") return null;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) setIsServicesOpen(false);
  };

  const toggleServices = () => {
    setIsServicesOpen(!isServicesOpen);
  };

  const handleLogout = () => {
    // Clear tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    // Redirect to home page
    router.push('/');
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

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
                    href="/" 
                    className={cn(navigationMenuTriggerStyle(), "text-xl")}
                  >
                    About
                  </Link>         
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-[#373E11] text-[#E6E4BB] rounded-lg hover:bg-[#454b28] transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
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
              {/* Mobile Auth Buttons */}
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-xl py-2 text-center border-[#373E11] flex items-center justify-center hover:text-[#E6E4BB] hover:bg-[#373E11]"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/login" className="text-base max-sm:text-xs w-72 text-center border border-[#373E11] hover:text-[#E6E4BB] hover:bg-[#373E11]">
                    Login
                  </Link>
                  <Link href="/signup" className="text-base max-sm:text-xs w-72 text-center border border-[#373E11] hover:text-[#E6E4BB] hover:bg-[#373E11]">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default NavBar;

const ListItem = React.forwardRef(({ className, title, href, ...props }, ref) => {
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
