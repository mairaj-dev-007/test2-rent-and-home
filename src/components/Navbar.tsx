import React from 'react'
import { Button } from './ui/button'
import { Heart, ShoppingCart } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import Link from 'next/link';

const navLinks = [
  {
    label: "Buy",
    dropdown: "Buy Link",
    links: [
      {
        heading: "Homes For Sale",
        items: [
          { label: "Home For Sale", href: "#" },
          { label: "Foreclosures", href: "#" },
          { label: "For Sale By Owner", href: "#" },
          { label: "Open Houses", href: "#" },
        ],
      },
      {
        heading: "Bundle Buying & Selling",
        items: [
          { label: "Buy And Sell With Zillow 360", href: "#" },
        ],
      },
      {
        heading: "Resources",
        items: [
          { label: "Buyers Guide", href: "#" },
          { label: "Foreclosure Center", href: "#" },
          { label: "Real Estate App", href: "#" },
        ],
      },
    ],
  },
  {
    label: "Rent",
    dropdown: "Rent Link",
    links: [
      {
        heading: "Tonkawa Rentals",
        items: [
          { label: "Rental Buildings", href: "#" },
          { label: "Apartments For Rent", href: "#" },
          { label: "Houses For Rent", href: "#" },
          { label: "All Rental Listings", href: "#" },
          { label: "All Rental Buildings", href: "#" },
        ],
      },
      {
        heading: "Renter Hub",
        items: [
          { label: "Contacted Rentals", href: "#" },
          { label: "Your Rental", href: "#" },
          { label: "Messages", href: "#" },
        ],
      },
      {
        heading: "Resources",
        items: [
          { label: "Affordability Calculator", href: "#" },
          { label: "Renters Guide", href: "#" },
        ],
      },
    ],
  },
  { label: "Sell", dropdown: "Sell Link" },
  { label: "Home Loans", dropdown: "Home Loans Link" },
  { label: "Agent Finder", dropdown: "Agent Finder Link" },
];

const Navbar = () => {
  return (
    <div className="relative z-50 max-w-7xl mx-auto">
      <header className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          {/* Navigation Links (Dropdowns) */}
          <div className="hidden md:flex items-center">
            <NavigationMenu className="relative">
              <NavigationMenuList>
                {navLinks.map((item) => (
                  item.links ? (
                    <NavigationMenuItem key={item.label}>
                      <NavigationMenuTrigger
                        className="text-black font-medium !bg-transparent !px-2 py-2 rounded-md transition-colors data-[state=open]:text-blue-600 hover:text-blue-600"
                      >
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="absolute left-0 !min-w-max p-8 pl-4 shadow-lg rounded-xl bg-white z-[999]">
                        <div className="grid grid-cols-3 divide-x divide-gray-200">
                          {item.links.map((col) => (
                            <div key={col.heading} className='pl-10 pr-20'>
                              <h3 className="font-bold text-xl mb-4">{col.heading}</h3>
                              <ul className="space-y-2">
                                {col.items.map((link) => (
                                    <Link key={link.label} href={link.href} className="text-black w-full !no-underline">
                                      <li className='hover:bg-gray-200 p-2 rounded-md transition-all duration-300'>
                                          {link.label}
                                      </li>
                                    </Link>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuLink
                      key={item.label}
                      href="#"
                      className="text-black font-medium !bg-transparent hover:text-blue-600 px-4 py-2 rounded-md flex items-center"
                    >
                      {item.label}
                    </NavigationMenuLink>
                  )
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Logo/Brand */}
          <div className="flex items-center font-sans font-bold !text-2xl text-[#4B6ED6] tracking-[-2px] relative">
            <span className='tracking-wider relative inline-block'>
              St<span className='text-[#FF7A59] underline'>i</span>ckball
            </span>
          </div>

          {/* Right Side Icons and Button */}
          <div className="hidden md:flex items-center space-x-10">
            <NavigationMenu>
                <NavigationMenuList className="flex space-x-3">
                  <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-black font-medium hover:!bg-transparent bg-transparent hover:!text-blue-600 !px-2 py-2 rounded-md transition-colors">
                      Help
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="min-w-max w-full !z-50">
                      <NavigationMenuLink
                        href="#"
                        className="block px-6 py-3 text-black hover:bg-gray-100 text-start"
                      >
                        Mortgage Calculator
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        href="#"
                        className="block px-6 py-3 text-black hover:bg-gray-100 text-start"
                      >
                        Budget Calculator
                      </NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            <a href="#" className="text-black hover:text-blue-400 transition-colors"><Heart className="w-6 h-6 text-gray-500 hover:text-black transition-colors hover:fill-black hover:scale-105 duration-300" /></a>
            <a href="#" className="text-black hover:text-blue-400 transition-colors"><ShoppingCart className="w-6 h-6 text-gray-500 hover:text-black transition-colors hover:fill-black hover:scale-105 duration-300" /></a>
            <Button className='bg-blue-600 font-semibold text-white hover:bg-blue-700 hover:scale-105 transition-all duration-300 px-5 !py-4 uppercase'>Skill Assessment</Button>
          </div>
        </nav>
      </header>
    </div>
  )
}

export default Navbar