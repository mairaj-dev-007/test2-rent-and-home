"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function HeroSection() {
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  return (
    <div className="min-h-screen relative">

      {/* Hero Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            <h1 className="text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              Find Real Estate and Get Your Dream Space
            </h1>
            <p className="text-2xl text-slate-800 leading-relaxed max-w-lg">
              Buy or rent comfortable and beautiful houses in many places
            </p>
          </div>

          {/* Right Side - Image with Overlay */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {/* House image */}
              <div className="w-full h-[500px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl relative">
                <Image
                  src="/hero-section-image.jpg"
                  alt="Modern house"
                  fill
                  className="object-cover object-top rounded-3xl"
                  priority
                />
                {/* Dark overlay to make text more readable */}
                <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
              </div>
              
              {/* Information Overlay */}
              <div className="absolute top-8 right-8 bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 max-w-56 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-3">Black Modern House</h3>
                <div className="flex items-center text-white text-base">
                  <div className="w-5 h-5 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
                  <span className="font-medium">New York Street 1260</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-10 max-w-5xl mx-auto">
          <div className="bg-white rounded-4xl p-8 shadow-2xl">
            <div className="grid md:grid-cols-4 gap-6">
              {/* Location */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Location</p>
                <div className="relative">
                  <select className="w-full p-4 border border-gray-200 rounded-xl appearance-none bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg">
                    <option>Bali, Indonesia</option>
                    <option>New York, USA</option>
                    <option>London, UK</option>
                    <option>Tokyo, Japan</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Property Type</p>
                <div className="relative">
                  <select className="w-full p-4 border border-gray-200 rounded-xl appearance-none bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg">
                    <option>Modern House</option>
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>Condo</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Average Price */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Average Price</p>
                <div className="relative">
                  <select className="w-full p-4 border border-gray-200 rounded-xl appearance-none bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg">
                    <option>$7500 - $10000</option>
                    <option>$5000 - $7500</option>
                    <option>$10000 - $15000</option>
                    <option>$15000+</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end gap-3">
                <Button className="w-full bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 hover:text-white transition-colors !py-3.5 cursor-pointer rounded-xl flex items-center justify-center text-lg font-semibold shadow-lg min-h-fit">
                  <Search className="w-5 h-5" />
                  Search
                </Button>
                <Button 
                  onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3.5 rounded-xl flex items-center justify-center shadow-lg min-h-fit transition-all duration-300"
                  title="Advanced Search"
                >
                  {isAdvancedSearchOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Collapsible Advanced Search */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isAdvancedSearchOpen ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'
            }`}>
              <div className="border-t border-gray-200 pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Address Search */}
                  <div className="space-y-3">
                    <label htmlFor="advanced-address" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Search Location</label>
                    <div className="relative">
                      <Input
                        id="advanced-address"
                        name="address"
                        type="text"
                        placeholder="Enter an address, neighbourhood, city or zip code"
                        className="w-full min-h-fit p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg pr-12"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <label htmlFor="advanced-price-min" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Price Range</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        id="advanced-price-min"
                        name="priceMin"
                        type="number"
                        placeholder="Min"
                        className="w-full p-4 rounded-xl min-h-fit border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      />
                      <Input
                        id="advanced-price-max"
                        name="priceMax"
                        type="number"
                        placeholder="Max"
                        className="w-full p-4 rounded-xl min-h-fit border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 