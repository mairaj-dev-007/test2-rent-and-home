"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, BedDouble, Bath, Ruler, Home, Search, MapPin, Calendar, Star, Eye } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

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

function formatAddress(address: House["address"]): string {
  return `${address.street}, ${address.city}, ${address.state}, ${address.zipcode}`;
}

export default function ListingPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({
    minPrice: 0,
    maxPrice: 2000000,
    beds: "",
    baths: "",
    propertyType: "",
    features: [] as string[],
  });
  const [showFiltered, setShowFiltered] = useState(false);
  const [filtered, setFiltered] = useState<House[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const purpose = searchParams.get('purpose') || '';

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => {
        const allHouses = data.listings || [];
        // Filter houses based on purpose
        const purposeFiltered = allHouses.filter((house: House) => {
          if (purpose === 'buy') {
            return house.status === 'For Sale';
          } else if (purpose === 'rent') {
            return house.status === 'For Rent';
          }
          return true; // Show all if no purpose specified
        });
        setHouses(purposeFiltered);
      });
  }, [purpose]);

  useEffect(() => {
    const q = search.toLowerCase();
    let filteredList = houses.filter((h) => {
      return (
        h.address.state.toLowerCase().includes(q) ||
        h.address.city.toLowerCase().includes(q) ||
        h.propertyType.toLowerCase().includes(q) ||
        h.price.toString().includes(q) ||
        h.bedrooms.toString().includes(q) ||
        h.bathrooms.toString().includes(q) ||
        h.areaSqFt.toString().includes(q) ||
        h.address.street.toLowerCase().includes(q) ||
        h.address.zipcode.toLowerCase().includes(q) ||
        h.address.country.toLowerCase().includes(q)
      );
    });
    if (showFiltered) {
      filteredList = filteredList.filter((h) => {
        const priceOk = h.price >= filter.minPrice && h.price <= filter.maxPrice;
        const bedsOk = !filter.beds || h.bedrooms >= Number(filter.beds);
        const bathsOk = !filter.baths || h.bathrooms >= Number(filter.baths);
        const typeOk = !filter.propertyType || h.propertyType === filter.propertyType;
        const featuresOk = filter.features.length === 0 || filter.features.every(fea => h.features.includes(fea));
        return priceOk && bedsOk && bathsOk && typeOk && featuresOk;
      });
    }
    setFiltered(filteredList);
  }, [search, houses, filter, showFiltered]);

  const getPageTitle = () => {
    if (purpose === 'rent') return 'Rent properties';
    if (purpose === 'buy') return 'Buy properties';
    return 'All properties';
  };

  const getPriceLabel = () => {
    return purpose === 'rent' ? 'Monthly Rent' : 'Price';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mx-auto px-4 pt-8">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="relative flex-1 min-w-[300px] max-w-2xl">
            <Input
              className="w-full h-12 px-6 text-base rounded-sm border-2 border-gray-200 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Search by city, state, property, type, badrooms, features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ boxShadow: "0 2px 8px 0 rgba(60,60,60,0.06)" }}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 focus:outline-none"
              tabIndex={-1}
              type="button"
            >
              <Search className="w-7 h-7" />
            </button>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="h-12 w-32 text-base px-10 font-semibold border-2 border-gray-200 rounded-sm flex gap-3 items-center text-gray-500 hover:border-blue-400 hover:text-blue-600 shadow-sm"
              >
                <svg width="28" height="28" fill="none" stroke="#8b8be0" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                Filters
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="min-w-max">
              <AlertDialogHeader>
                <AlertDialogTitle>Filter Properties</AlertDialogTitle>
                <AlertDialogDescription>
                  Use the options below to filter your search.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-6 py-4">
                {/* Price Range */}
                <div>
                  <div className="font-medium mb-2">{getPriceLabel()} Range</div>
                  <Slider
                    min={0}
                    max={purpose === 'rent' ? 10000 : 2000000}
                    step={purpose === 'rent' ? 100 : 50000}
                    value={[filter.minPrice, filter.maxPrice]}
                    onValueChange={([min, max]) => setFilter(f => ({ ...f, minPrice: min, maxPrice: max }))}
                  />
                  <div className="flex justify-between text-sm mt-1">
                    <span>${filter.minPrice.toLocaleString()}</span>
                    <span>${filter.maxPrice.toLocaleString()}</span>
                  </div>
                </div>
                {/* Beds */}
                <div>
                  <div className="font-medium mb-2">Bedrooms</div>
                  <RadioGroup
                    value={filter.beds}
                    onValueChange={val => setFilter(f => ({ ...f, beds: val }))}
                    className="flex gap-4"
                  >
                    <RadioGroupItem value="" id="beds-any" /> <label htmlFor="beds-any">Any</label>
                    {[1,2,3,4,5].map(n => (
                      <span key={n}>
                        <RadioGroupItem value={n.toString()} id={`beds-${n}`} />
                        <label htmlFor={`beds-${n}`}>{n}+</label>
                      </span>
                    ))}
                  </RadioGroup>
                </div>
                {/* Baths */}
                <div>
                  <div className="font-medium mb-2">Bathrooms</div>
                  <RadioGroup
                    value={filter.baths}
                    onValueChange={val => setFilter(f => ({ ...f, baths: val }))}
                    className="flex gap-4"
                  >
                    <RadioGroupItem value="" id="baths-any" /> <label htmlFor="baths-any">Any</label>
                    {[1,2,3,4,5].map(n => (
                      <span key={n}>
                        <RadioGroupItem value={n.toString()} id={`baths-${n}`} />
                        <label htmlFor={`baths-${n}`}>{n}+</label>
                      </span>
                    ))}
                  </RadioGroup>
                </div>
                {/* Property Type */}
                <div>
                  <div className="font-medium mb-2">Property Type</div>
                  <RadioGroup
                    value={filter.propertyType}
                    onValueChange={val => setFilter(f => ({ ...f, propertyType: val }))}
                    className="flex gap-4"
                  >
                    <RadioGroupItem value="" id="type-any" /> <label htmlFor="type-any">Any</label>
                    {["Single Family", "Condo", "Apartment", "Villa", "Ranch", "Modern", "Historic"].map(type => (
                      <span key={type}>
                        <RadioGroupItem value={type} id={`type-${type}`} />
                        <label htmlFor={`type-${type}`}>{type}</label>
                      </span>
                    ))}
                  </RadioGroup>
                </div>
                {/* Features */}
                <div>
                  <div className="font-medium mb-2">Features</div>
                  <div className="flex flex-wrap gap-4">
                    {["Pool", "Garage", "Fireplace", "Gym", "Backyard", "Balcony"].map(feature => (
                      <label key={feature} className="flex items-center gap-2">
                        <Checkbox
                          checked={filter.features.includes(feature)}
                          onCheckedChange={checked =>
                            setFilter(f => ({
                              ...f,
                              features: checked
                                ? [...f.features, feature]
                                : f.features.filter(fea => fea !== feature)
                            }))
                          }
                        />
                        {feature}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowFiltered(false)}>Cancel</AlertDialogCancel>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFilter({
                      minPrice: 0,
                      maxPrice: purpose === 'rent' ? 10000 : 2000000,
                      beds: "",
                      baths: "",
                      propertyType: "",
                      features: [],
                    });
                    setShowFiltered(false);
                  }}
                >
                  Clear Filters
                </Button>
                <AlertDialogAction
                  onClick={() => setShowFiltered(true)}
                >
                  Apply Filters
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6 max-w-[1600px] mx-auto px-4 py-8">
        {/* Left: Map */}
        <div className="md:w-[45%] w-full h-[150px] md:h-[calc(100vh-120px)] bg-gray-100 rounded-2xl shadow relative flex items-center justify-center overflow-hidden md:sticky md:top-8 md:self-start">
          <StaticMap houses={filtered} />
        </div>
        {/* Right: Filters + Grid */}
        <div className="flex-1 flex flex-col max-h-[calc(100vh-120px)] overflow-y-auto p-3">
          <h2 className="text-2xl font-bold mb-4">Stickball {getPageTitle()}</h2>
          {/* Grid of Houses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((house) => (
              <Link key={house.id} href={`/listing/${house.id}`} className="block group">
                <Card className="min-w-[300px] !pt-0 pb-0 gap-0 rounded-lg shadow-sm border-0 overflow-hidden bg-white h-full flex flex-col hover:scale-101 transition-all duration-300 group-hover:shadow-md">
                  {/* Image Section */}
                  <div className="relative">
                    <img
                      src={house.images[0]}
                      alt={house.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => (e.currentTarget.src = "/hero-section-image.jpg")}
                    />
                    {/* Overlay with multiple action buttons */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between items-center">
                        <div className="flex items-center gap-1 text-white">
                          <Eye className="w-2.5 h-2.5" />
                          <span className="text-xs font-medium">View Details</span>
                        </div>
                        <button className="bg-white/20 backdrop-blur-sm rounded-full p-1 hover:bg-white/30 transition-colors">
                          <Heart className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>
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
                    {/* Price and Rating */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1">
                        <div className="text-base font-bold text-blue-700">{house.currency} {house.price.toLocaleString()}</div>
                        <span className="text-xs text-gray-500">/ {purpose === 'rent' ? 'month' : 'total'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />
                        <span className="text-xs font-semibold text-gray-700">4.8</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {house.title}
                    </h3>

                    {/* Key Features Grid - Made smaller and more subtle */}
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
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-1.5 rounded-md shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-101 text-xs">
                      <Eye className="w-2.5 h-2.5 mr-1" />
                      {house.status === 'For Sale' ? 'Buy this house' : 'Rent this house'}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-12 text-lg">No properties found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
