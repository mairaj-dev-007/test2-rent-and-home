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
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  yearBuilt: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  features: string[];
  images: string[];
  listingDate: string;
  status: string;
  agent: {
    name: string;
    phone: string;
    email: string;
    agency: string;
  };
}

function formatAddress(address: House["address"]): string {
  return `${address.street}, ${address.city}, ${address.state}, ${address.zipcode}`;
}

export default function Home() {
  const [houses, setHouses] = useState<House[]>([]);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => setHouses(data.listings || []));
  }, []);

  return (
    <main>
      <HeroSection />
      <div className="my-12 mx-auto px-20">
        <h3 className="text-2xl font-bold mb-6 ml-4">Homes for you</h3>
        <Carousel className="w-full" opts={{ loop: true, align: "start", slidesToScroll: 1 }}>
          <CarouselContent className="-ml-4 py-3 bg-transparent">
            {houses.map((house) => (
              <CarouselItem
                key={house.id}
                className="pl-4 basis-80 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <Card className="min-w-[280px] !pt-0 pb-0 gap-0 rounded-lg shadow-sm border-0 overflow-hidden bg-white h-full flex flex-col hover:scale-101 transition-all duration-300 group-hover:shadow-md">
                  {/* Image Section */}
                  <div className="relative">
                    <img
                      src={house.images[0]}
                      alt={house.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => (e.currentTarget.src = "/hero-section-image.jpg")}
                    />
                    {/* Status Badge */}
                    <div className="absolute top-1.5 left-1.5">
                      <span className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        {house.status}
                      </span>
                    </div>
                    {/* Property Type Badge */}
                    <div className="absolute top-1.5 right-1.5">
                      <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        {house.propertyType}
                      </span>
                    </div>
                  </div>
                  {/* Content Section */}
                  <CardContent className="p-3 pb-3">
                    {/* Price */}
                    <div className="flex items-center gap-1 mb-1.5">
                      <div className="text-base font-bold text-blue-700">{house.currency} {house.price.toLocaleString()}</div>
                      <span className="text-xs text-gray-500">/ {house.status === 'For Rent' ? 'month' : 'total'}</span>
                    </div>
                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {house.title}
                    </h3>
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
                        <span className="text-xs font-medium text-gray-700">{house.areaSqFt.toLocaleString()}</span>
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
                        <span>Listed {new Date(house.listingDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {/* Features Preview */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {house.features.slice(0, 2).map((feature, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 text-xs px-1 py-0.5 rounded-full">
                          {feature}
                        </span>
                      ))}
                      {house.features.length > 2 && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-1 py-0.5 rounded-full">
                          +{house.features.length - 2} more
                        </span>
                      )}
                    </div>
                    {/* Action Button */}
                    <Link href={`/listing/${house.id}`} className="block mt-1">
                      <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-md shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-101 text-xs flex items-center justify-center">
                        <Eye className="w-2.5 h-2.5 mr-1" />
                        {house.status === 'For Sale' ? 'Buy this house' : 'Rent this house'}
                      </button>
                    </Link>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious size="icon" className="!w-14 !h-14" />
          <CarouselNext size="icon" className="!w-14 !h-14" />
        </Carousel>
      </div>
      {/* 3 Feature Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 mb-8 px-2 max-w-7xl mx-auto">
        {/* Buy a home */}
        <div className="bg-white rounded-2xl shadow-md flex flex-col gap-4 items-center p-8 pb-12 text-center border border-gray-100 hover:scale-105 transition-all duration-300">
          <img src="/buy-home.webp" alt="Buy a home" className="w-full h-auto object-contain mb-4" />
          <h3 className="text-3xl font-bold mb-2">Buy a home</h3>
          <p className="text-gray-500 mb-6">Find your place with an immersive photo experience and the most listings, including things you won't find anywhere else.</p>
          <Link href="/listing?purpose=buy" passHref>
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
          <Link href="/listing?purpose=rent" passHref>
            <span className="inline-block border border-blue-500 text-blue-600 font-semibold rounded-lg px-6 py-2 hover:bg-blue-50 transition cursor-pointer">Find rentals</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
