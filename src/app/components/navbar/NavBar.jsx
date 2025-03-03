"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Link from 'next/link'
import Image from "next/image";
import Auth from "../authen/Auth"

const components = [
    {
      title: "แจ้งเตือนการรดน้ำ",
      href: "/",
    },
    {
        title: "แนะนำพืชที่เหมาะสมกับสภาพแวดล้อม",
        href: "/",
    },
    {
        title: "วิเคราะห์ปัญหาต้นไม้",
        href: "/",
    },
    {
        title: "สมุดจดบันทึกต้นไม้",
        href: "/",
    }
  ]

export function NavBar() {
  return (
    <div className="border-b border-[#373E11] h-24">
        <div className="flex items-center justify-between px-4 py-2">
            <Image
                    className="float-left mt-[-34px]"
                    src="/logo.png"
                    alt="logo"
                    width={160}
                    height={0}
                />
            <NavigationMenu>
                <NavigationMenuList className="flex gap-4 mt-[-41px]">
                    <NavigationMenuItem>
                        <Link href="/" legacyBehavior passHref>
                            <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-xl`}>
                                Home 
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger className="text-xl">Services</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="flex flex-col items-center justify-items-center md:w-[280px] md:grid-cols-2 lg:w-[280px] ">
                            {components.map((component) => (
                                <ListItem
                                key={component.title}
                                title={component.title}
                                href={component.href}
                                >
                                </ListItem>
                            ))}
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                    <Link href="/" legacyBehavior passHref>
                            <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-xl`}>
                                About
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <Auth />
        </div>
    </div>
  )
}

export default NavBar

const ListItem = React.forwardRef(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors min-h-[50px] flex items-center justify-center text-sm font-medium hover:bg-[#373E11]  hover:text-white",
            className
          )}
          {...props}
        >
          {title}
        </a>
      </NavigationMenuLink>
    </li>
  );
});

  
  ListItem.displayName = "ListItem";
