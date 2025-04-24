"use client"
import * as React from "react";
import { usePathname } from "next/navigation";
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
import { X, Menu, ChevronUp, ChevronDown } from "lucide-react";
import Auth from "../authen/Auth";

const components = [
  { title: "แจ้งเตือนการรดน้ำ", href: "/" },
  { title: "แนะนำพืชที่เหมาะสมกับสภาพแวดล้อม", href: "/recommend" },
  { title: "วิเคราะห์ปัญหาต้นไม้", href: "/diagnosis" },
  { title: "สมุดจดบันทึกต้นไม้", href: "/diary" },
];

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isServicesOpen, setIsServicesOpen] = React.useState(false);
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/signup") return null;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) setIsServicesOpen(false); // Close services dropdown when closing the menu
  };

  const toggleServices = () => {
    setIsServicesOpen(!isServicesOpen);
  };

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
            <img src="/plantelogo.svg" alt="logo" className="h-12 w-auto" />
          </div>

          {/* Navigation Menu (Desktop) */}
          <div className="max-md:hidden">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-4">
                <NavigationMenuItem>
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-xl")}>
                    <Link href="/" passHref>Home</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-xl">Services</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="flex flex-col items-center md:w-[280px]">
                      {components.map((component) => (
                        <ListItem key={component.title} title={component.title} href={component.href} />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-xl")}>
                      <Link href='/' passHref>About</Link>         
                    </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Login Button */}
          <div className="flex items-center">
            <Auth />
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
              <Link href="/" className="text-xl py-2 w-full text-center border-[#373E11] hover:text-[#E6E4BB] hover:bg-[#373E11]">
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
                              href={component.href}
                              className="py-3 px-4 block text-center text-[16px] hover:bg-[#373E11] hover:text-white transition-colors"
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
              <Link href="/" className="text-xl py-2 w-full text-center border-[#373E11] hover:text-[#E6E4BB] hover:bg-[#373E11]">
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

const ListItem = React.forwardRef(({ className, title, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={ref}
          className={cn(
            "select-none space-y-1 rounded-md p-4 leading-none no-underline outline-none transition-colors min-h-[60px] flex items-center justify-center text-[18px] text-center font-normal hover:bg-[#373E11] hover:text-white",
            className
          )}
          {...props}
        >
          {title}
        </Link>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = "ListItem";
