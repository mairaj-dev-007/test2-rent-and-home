"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { X, ArrowLeft, BedDouble, Bath, Ruler, Calendar, Phone, Mail, Building2, Star, CheckCircle, MapPin, Home } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const StaticMap = dynamic(() => import("@/components/StaticMap"), { ssr: false });

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

export default function ListingDetailPage() {
  const { id } = useParams();
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => {
        const foundHouse = data.listings.find((h: House) => h.id === id);
        setHouse(foundHouse || null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-12 text-center text-lg">Loading...</div>;
  if (!house) return <div className="p-12 text-center text-lg text-red-500">House not found.</div>;

  // Determine context from house.status
  const isRent = house.status === 'For Rent';
  const isSale = house.status === 'For Sale';

  const pricePerSqft = house.price && house.areaSqFt ? Math.round(house.price / house.areaSqFt) : null;
  const availableDate = house.listingDate || "Fri Aug 1 2025";
  const petPolicy = "Cats, small dogs OK";
  const leaseDuration = "Minimum 1-year lease agreement.";
  const grossIncome = "2.25x rent";
  const creditScore = "680+";
  const priceHistory = [
    { date: "7/20/2025", event: isRent ? "Listed for rent" : "Listed for sale", price: house.price * 0.95, change: -4.5 },
    { date: "7/6/2024", event: "Listing removed", price: null, change: null },
    { date: "6/8/2024", event: isRent ? "Listed for rent" : "Listed for sale", price: house.price * 1.05, change: null },
  ];

  const getActionButtonText = () => {
    return isRent ? 'Rent this house' : 'Buy this house';
  };

  const getPriceLabel = () => {
    return isRent ? 'Monthly Rent' : 'Price';
  };

  const getStatusLabel = () => {
    return isRent ? 'For Rent' : 'For Sale';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Back to Listings */}
      <div className="mb-6">
        <Link href={`/listing?purpose=${isRent ? 'rent' : 'buy'}`} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to {isRent ? 'Rentals' : 'Listings'}
        </Link>
      </div>

      {/* Carousel */}
      <div className="mb-8 px-3">
        <div className="relative w-full mx-auto rounded-2xl overflow-hidden shadow-lg">
          {/* View all photos button (overlapping carousel, top-right) */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="absolute top-4 right-4 z-30 bg-white/90 hover:bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg shadow flex items-center gap-2 border border-blue-100">
                <span>View all photos</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="!max-w-[90vw] !max-h-[90vh] p-0 overflow-hidden">
              <AlertDialogHeader className="sticky top-0 z-10 bg-white shadow-sm flex flex-row items-center justify-between px-8 py-4 border-b">
                <div className="flex items-center gap-4">
                  <AlertDialogTitle className="text-2xl font-bold">All Photos</AlertDialogTitle>
                  <span className="text-base text-gray-500 font-medium">{house.images.length} photo{house.images.length > 1 ? 's' : ''}</span>
                </div>
                <AlertDialogCancel className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 ml-auto">
                  <X className="w-6 h-6" />
                </AlertDialogCancel>
              </AlertDialogHeader>
              <div className="max-h-[75vh] overflow-y-auto p-8 grid gap-8 bg-white">
                {house.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={house.title}
                    className="w-full max-h-[70vh] object-contain rounded-xl border"
                    onError={e => (e.currentTarget.src = "/hero-section-image.jpg")}
                  />
                ))}
              </div>
            </AlertDialogContent>
          </AlertDialog>
          <Carousel className="w-full" opts={{ loop: true }}>
            <CarouselContent>
              {house.images.map((img, i) => (
                <CarouselItem key={i} className="flex items-center justify-center bg-gray-100">
                  <img
                    src={img}
                    alt={house.title}
                    className="w-full h-[450px] object-cover rounded-2xl"
                    onError={e => (e.currentTarget.src = "/hero-section-image.jpg")}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="!left-4 !top-1/2 -translate-y-1/2 z-20 bg-black/70 text-white hover:bg-black" />
            <CarouselNext className="!right-4 !top-1/2 -translate-y-1/2 z-20 bg-black/70 text-white hover:bg-black" />
          </Carousel>
        </div>
      </div>

      {/* Key Details Box */}
      <Card className="mb-8 p-6 bg-blue-50/60 border-blue-100 shadow flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex flex-wrap gap-8 items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold text-blue-700">{house.currency} {house.price.toLocaleString()}</div>
            <span className="text-sm text-gray-600">/ {isRent ? 'month' : 'total'}</span>
          </div>
          <div className="flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-blue-600" />
            <span className="font-semibold">{house.bedrooms} beds</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="w-6 h-6 text-blue-600" />
            <span className="font-semibold">{house.bathrooms} baths</span>
          </div>
          <div className="flex items-center gap-2">
            <Ruler className="w-6 h-6 text-blue-600" />
            <span className="font-semibold">{house.areaSqFt.toLocaleString()} sqft</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-600" />
            <span className="font-semibold">{house.propertyType}</span>
          </div>
          <Badge variant={house.status === getStatusLabel() ? "default" : "secondary"}>{house.status}</Badge>
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span className="font-semibold">{house.address.city}, {house.address.state}</span>
          </div>
        </div>
      </Card>

      {/* Title, Price, Main Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Home className="text-blue-600" /> {house.title}
        </h1>
        <div className="text-3xl font-semibold text-blue-700">{house.currency} {house.price.toLocaleString()}</div>
      </div>
      <div className="flex flex-wrap gap-4 items-center mb-2">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-5 h-5" />
          {house.address.street}, {house.address.city}, {house.address.state} {house.address.zipcode}
        </div>
        <Badge variant={house.status === getStatusLabel() ? "default" : "secondary"}>{house.status}</Badge>
        <Badge variant="secondary">Listed: {house.listingDate}</Badge>
        {pricePerSqft && <Badge variant="outline">${pricePerSqft}/sqft</Badge>}
      </div>
      <div className="flex flex-wrap gap-8 items-center mb-6 text-lg">
        <div className="flex items-center gap-2"><BedDouble className="w-6 h-6 text-blue-600" /> <span className="font-bold">{house.bedrooms}</span> beds</div>
        <div className="flex items-center gap-2"><Bath className="w-6 h-6 text-blue-600" /> <span className="font-bold">{house.bathrooms}</span> baths</div>
        <div className="flex items-center gap-2"><Ruler className="w-6 h-6 text-blue-600" /> <span className="font-bold">{house.areaSqFt.toLocaleString()}</span> sqft</div>
        <div className="flex items-center gap-2"><Calendar className="w-6 h-6 text-blue-600" /> Built {house.yearBuilt}</div>
      </div>

      {/* Facts & Features */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Facts & features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-xl p-6">
          <div>
            <h3 className="font-semibold mb-3">Interior</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> {house.bedrooms} bedrooms</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> {house.bathrooms} bathrooms</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> {house.areaSqFt.toLocaleString()} sqft interior area</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Built in {house.yearBuilt}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Features</h3>
            <ul className="space-y-2 text-sm">
              {house.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" /> {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Price History */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Price history</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[400px] w-full text-left border rounded-lg bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Event</th>
                <th className="px-4 py-3 font-semibold">{getPriceLabel()}</th>
                <th className="px-4 py-3 font-semibold">Change</th>
              </tr>
            </thead>
            <tbody>
              {priceHistory.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-3">{item.date}</td>
                  <td className="px-4 py-3">{item.event}</td>
                  <td className="px-4 py-3">{item.price ? `${house.currency} ${item.price.toLocaleString()}` : '-'}</td>
                  <td className="px-4 py-3">{item.change ? `${item.change}%` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* What's Special */}
      <div className="mb-8">
        <div className="font-semibold mb-2 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" /> What's special
        </div>
        <div className="flex flex-wrap gap-3 mb-2">
          {house.features.map((feature, index) => (
            <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {feature}
            </Badge>
          ))}
        </div>
        <div className="text-gray-700 leading-relaxed">
          {house.description}
        </div>
      </div>

      {/* Lease/Criteria Section - Only show for rentals */}
      {isRent && (
        <div className="mb-8">
          <div className="font-semibold mb-2">Lease Agreement and Requirements:</div>
          <div className="flex flex-wrap gap-4 mb-2">
            <Badge variant="outline">Lease Duration: {leaseDuration}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-semibold text-gray-800">Gross Income</div>
              <div className="text-blue-600">{grossIncome}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-semibold text-gray-800">Credit Score</div>
              <div className="text-blue-600">{creditScore}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-semibold text-gray-800">Pet Policy</div>
              <div className="text-blue-600">{petPolicy}</div>
            </div>
          </div>
        </div>
      )}

      {/* Agent Info */}
      <Card className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start mb-8">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-semibold mb-2">{house.agent.name}</h3>
          <p className="text-gray-600 mb-2">{house.agent.agency}</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span className="text-sm">{house.agent.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm">{house.agent.email}</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Contact Agent
          </Button>
        </div>
      </Card>

      {/* Main Action Button */}
      <div className="mb-8">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 text-lg">
          {getActionButtonText()}
        </Button>
      </div>

      {/* Map section at the end */}
      <div className="mb-8">
        <div className="w-full h-72 rounded-xl overflow-hidden shadow">
          <StaticMap houses={[house]} center={[house.location.lat, house.location.lng]} zoom={16} />
        </div>
      </div>
    </div>
  );
}
