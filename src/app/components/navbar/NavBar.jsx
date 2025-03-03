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
    <div className="border-2 h-24">
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
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  });
  
  ListItem.displayName = "ListItem";
