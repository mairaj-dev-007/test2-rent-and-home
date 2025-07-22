"use client";

import { HeroSection } from "@/components/hero-section";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BedDouble, Bath, Ruler, MapPin, Calendar, Eye } from "lucide-react";

// Define the type for a house listing
interface House {
  _id: string;
  zpid?: number;
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zipcode: string;
    neighborhood?: string | null;
    community?: string | null;
    subdivision?: string | null;
  };
  photos: string[];
  bedrooms: number;
  bathrooms: number;
  price: number;
  yearBuilt: number;
  longitude: number;
  latitude: number;
  homeStatus: string;
  description: string;
  livingArea: number;
  currency: string;
  homeType: string;
  datePostedString: string;
  daysOnZillow?: number;
  url: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

function formatAddress(address: House["address"]): string {
  return `${address.streetAddress}, ${address.city}, ${address.state}, ${address.zipcode}`;
}

// Carousel skeleton card for homepage
function CarouselHouseSkeleton() {
  return (
    <Card className="min-w-[280px] !pt-0 pb-0 gap-0 rounded-lg shadow-sm border-0 overflow-hidden bg-white h-full flex flex-col">
      {/* Image skeleton */}
      <div className="relative">
        <div className="w-full h-32 bg-gray-200 animate-pulse"></div>
        {/* Status badge skeleton */}
        <div className="absolute top-1.5 left-1.5">
          <div className="w-12 h-4 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
        {/* Property type badge skeleton */}
        <div className="absolute top-1.5 right-1.5">
          <div className="w-16 h-4 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      </div>
      <CardContent className="p-3 pb-3">
        {/* Price skeleton */}
        <div className="flex items-center gap-1 mb-1.5">
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>
        {/* Address skeleton */}
        <div className="mb-1.5">
          <div className="w-32 h-4 bg-gray-200 rounded mb-1 animate-pulse"></div>
          <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>
        {/* Features grid skeleton */}
        <div className="grid grid-cols-3 gap-1 mb-2">
          <div className="flex flex-col items-center p-1.5 bg-blue-50 rounded-sm">
            <div className="w-3 h-3 bg-gray-300 rounded mb-0.5 animate-pulse"></div>
            <div className="w-4 h-3 bg-gray-300 rounded mb-0.5 animate-pulse"></div>
            <div className="w-6 h-3 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="flex flex-col items-center p-1.5 bg-green-50 rounded-sm">
            <div className="w-3 h-3 bg-gray-300 rounded mb-0.5 animate-pulse"></div>
            <div className="w-4 h-3 bg-gray-300 rounded mb-0.5 animate-pulse"></div>
            <div className="w-6 h-3 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="flex flex-col items-center p-1.5 bg-purple-50 rounded-sm">
            <div className="w-3 h-3 bg-gray-300 rounded mb-0.5 animate-pulse"></div>
            <div className="w-8 h-3 bg-gray-300 rounded mb-0.5 animate-pulse"></div>
            <div className="w-6 h-3 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
        {/* Button skeleton */}
        <div className="w-full h-8 bg-gray-200 rounded-md animate-pulse"></div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [houses, setHouses] = useState<House[]>([]);

  useEffect(() => {
    fetch("/api/homes?page=1&limit=15")
      .then((res) => res.json())
      .then((apiData) => {
        // Normalize API data to House[]
        const listings = (apiData.data || []).map((item: any) => ({
          _id: item._id || item.zpid || item.id,
          zpid: item.zpid,
          address: {
            streetAddress: item.address?.streetAddress || "",
            city: item.address?.city || "",
            state: item.address?.state || "",
            zipcode: item.address?.zipcode || "",
            neighborhood: item.address?.neighborhood || null,
            community: item.address?.community || null,
            subdivision: item.address?.subdivision || null,
          },
          photos: item.photos || [],
          bedrooms: item.bedrooms || 0,
          bathrooms: item.bathrooms || 0,
          price: item.price || 0,
          yearBuilt: item.yearBuilt || 0,
          longitude: item.longitude || 0,
          latitude: item.latitude || 0,
          homeStatus: item.homeStatus || "",
          description: item.description || "",
          livingArea: item.livingArea || 0,
          currency: item.currency || "USD",
          homeType: item.homeType || "",
          datePostedString: item.datePostedString || item.createdAt || new Date().toISOString(),
          daysOnZillow: item.daysOnZillow,
          url: item.url || "",
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          __v: item.__v,
        }));
        setHouses(listings);
      });
  }, []);

  return (
    <main>
      <HeroSection />
      <div className="my-12 mx-auto px-20">
        <h3 className="text-2xl font-bold mb-6 ml-4">Homes for you</h3>
        <Carousel className="w-full" opts={{ loop: true, align: "start", slidesToScroll: 1 }}>
          <CarouselContent className="-ml-4 py-3 bg-transparent">
            {houses.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <CarouselItem
                    key={i}
                    className="pl-4 basis-80 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <CarouselHouseSkeleton />
                  </CarouselItem>
                ))
              : houses.map((house) => (
                  <CarouselItem
                    key={house._id}
                    className="pl-4 basis-80 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <Card className="min-w-[280px] !pt-0 pb-0 gap-0 rounded-lg shadow-sm border-0 overflow-hidden bg-white h-full flex flex-col hover:scale-101 transition-all duration-300 group-hover:shadow-md">
                      {/* Image Section */}
                      <div className="relative">
                        <img
                          src={house.photos[0]}
                          alt={house.address.streetAddress}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => (e.currentTarget.src = "/hero-section-image.jpg")}
                        />
                        {/* Status Badge */}
                        <div className="absolute top-1.5 left-1.5">
                          <span className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                            {house.homeStatus}
                          </span>
                        </div>
                        {/* Property Type Badge */}
                        <div className="absolute top-1.5 right-1.5">
                          <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                            {house.homeType}
                          </span>
                        </div>
                      </div>
                      {/* Content Section */}
                      <CardContent className="p-3 pb-3">
                        {/* Price */}
                        <div className="flex items-center gap-1 mb-1.5">
                          <div className="text-base font-bold text-blue-700">{house.currency} {house.price.toLocaleString()}</div>
                          <span className="text-xs text-gray-500">/ {house.homeStatus === 'For Rent' ? 'month' : 'total'}</span>
                        </div>
                        {/* Address (2 lines) */}
                        <div className="mb-1.5">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {house.address.streetAddress}
                          </div>
                          <div className="text-xs text-gray-700">
                            {house.address.city}, {house.address.state} {house.address.zipcode}
                          </div>
                        </div>
                        {/* Key Features Grid */}
                        <div className="grid grid-cols-3 gap-1 mb-2">
                          <div className="flex flex-col items-center p-1.5 bg-blue-50 rounded-sm group-hover:bg-blue-100 transition-colors">
                            <BedDouble className="w-3 h-3 text-blue-600 mb-0.5" />
                            <span className="text-xs font-medium text-gray-700">{house.bedrooms}</span>
                            <span className="text-xs text-gray-500">beds</span>
                          </div>
                          <div className="flex flex-col items-center p-1.5 bg-green-50 rounded-sm group-hover:bg-green-100 transition-colors">
                            <Bath className="w-3 h-3 text-green-600 mb-0.5" />
                            <span className="text-xs font-medium text-gray-700">{house.bathrooms}</span>
                            <span className="text-xs text-gray-500">baths</span>
                          </div>
                          <div className="flex flex-col items-center p-1.5 bg-purple-50 rounded-sm group-hover:bg-purple-100 transition-colors">
                            <Ruler className="w-3 h-3 text-purple-600 mb-0.5" />
                            <span className="text-xs font-medium text-gray-700">{house.livingArea.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">sqft</span>
                          </div>
                        </div>
                        {/* Location and Date */}
                        <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-red-500" />
                            <span className="truncate">{house.address.city}, {house.address.state}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-gray-400" />
                            <span>Listed {new Date(house.datePostedString).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {/* Features Preview */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {/* The original code had features.slice(0, 2).map, but features is not defined in the new interface.
                              Assuming the intent was to use a placeholder or remove this section if features are not available.
                              For now, removing the map as features is not part of the House interface. */}
                        </div>
                        {/* Action Button */}
                        <Link href={house.homeStatus === 'RECENTLY_SOLD' ? '#' : `/houses/${house._id}`} className="block mt-1">
                          <button
                            className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-md shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-101 text-xs flex items-center justify-center ${house.homeStatus === 'RECENTLY_SOLD' ? 'opacity-60 cursor-not-allowed' : ''}`}
                            disabled={house.homeStatus === 'RECENTLY_SOLD'}
                          >
                            <Eye className="w-2.5 h-2.5 mr-1" />
                            {house.homeStatus === 'RECENTLY_SOLD'
                              ? 'Sold'
                              : house.homeStatus === 'For Rent'
                                ? 'Rent this house'
                                : 'Buy this house'}
                          </button>
                        </Link>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
          </CarouselContent>
          <CarouselPrevious size="icon" className="!w-10 !h-10" />
          <CarouselNext size="icon" className="!w-10 !h-10" />
        </Carousel>
      </div>
      {/* 3 Feature Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 mb-8 px-2 max-w-7xl mx-auto">
        {/* Buy a home */}
        <div className="bg-white rounded-2xl shadow-md flex flex-col gap-4 items-center p-8 pb-12 text-center border border-gray-100 hover:scale-105 transition-all duration-300">
          <img src="/buy-home.webp" alt="Buy a home" className="w-full h-auto object-contain mb-4" />
          <h3 className="text-3xl font-bold mb-2">Buy a home</h3>
          <p className="text-gray-500 mb-6">Find your place with an immersive photo experience and the most listings, including things you won't find anywhere else.</p>
          <Link href="/houses" passHref>
            <span className="inline-block border border-blue-500 text-blue-600 font-semibold rounded-lg px-6 py-2 hover:bg-blue-50 transition cursor-pointer">Browse homes</span>
          </Link>
        </div>
        {/* Sell a home */}
        <div className="bg-white rounded-2xl shadow-md flex flex-col gap-4 items-center p-8 pb-12 text-center border border-gray-100 hover:scale-105 transition-all duration-300">
          <img src="/sell-home.webp" alt="Sell a home" className="w-full h-auto object-contain mb-4" />
          <h3 className="text-3xl font-bold mb-2">Sell a home</h3>
          <p className="text-gray-500 mb-6">No matter what path you take to sell your home, we can help you navigate a successful sale.</p>
          <Link href="#" passHref>
            <span className="inline-block border border-blue-500 text-blue-600 font-semibold rounded-lg px-6 py-2 hover:bg-blue-50 transition cursor-pointer">See your options</span>
          </Link>
        </div>
        {/* Rent a home */}
        <div className="bg-white rounded-2xl shadow-md flex flex-col gap-4 items-center p-8 pb-12 text-center border border-gray-100 hover:scale-105 transition-all duration-300">
          <img src="/rent-home.webp" alt="Rent a home" className="w-full h-auto object-contain mb-4" />
          <h3 className="text-3xl font-bold mb-2">Rent a home</h3>
          <p className="text-gray-500 mb-6">We're creating a seamless online experience – from shopping on the largest rental network to applying, to paying rent.</p>
          <Link href="/houses" passHref>
            <span className="inline-block border border-blue-500 text-blue-600 font-semibold rounded-lg px-6 py-2 hover:bg-blue-50 transition cursor-pointer">Find rentals</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
