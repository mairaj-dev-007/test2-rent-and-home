"use client";

import { useState, ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Home, BedDouble, Bath, Ruler, Calendar, UploadCloud, X } from "lucide-react";

interface HouseForm {
  streetAddress: string;
  city: string;
  state: string;
  zipcode: string;
  neighborhood?: string;
  community?: string;
  subdivision?: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  yearBuilt: string;
  livingArea: string;
  homeType: string;
  homeStatus: string;
  description: string;
  currency: string;
}

const initialForm: HouseForm = {
  streetAddress: "",
  city: "",
  state: "",
  zipcode: "",
  neighborhood: "",
  community: "",
  subdivision: "",
  price: "",
  bedrooms: "",
  bathrooms: "",
  yearBuilt: "",
  livingArea: "",
  homeType: "",
  homeStatus: "For Sale",
  description: "",
  currency: "USD",
};

export default function SellPage() {
  const [form, setForm] = useState<HouseForm>(initialForm);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here (e.g., send to API)
    alert("Submitted! (Demo only)");
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-transparent bg-clip-text">Sell Your Home</h1>
      <form onSubmit={handleSubmit} className="space-y-10">
        <Card className="bg-white/90 shadow-lg border-0">
          <CardContent className="py-6 space-y-10">
            {/* Address Fields */}
            <div className="bg-blue-50/40 rounded-xl p-6 mb-2">
              <h2 className="text-xl font-bold mb-6 text-primary flex items-center gap-2"><Home className="w-6 h-6 text-primary" /> Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label htmlFor="streetAddress" className="font-semibold text-primary flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Street Address</label>
                  <Input id="streetAddress" name="streetAddress" value={form.streetAddress} onChange={handleInputChange} placeholder="Street Address" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="city" className="font-semibold text-primary flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> City</label>
                  <Input id="city" name="city" value={form.city} onChange={handleInputChange} placeholder="City" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="state" className="font-semibold text-primary flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> State</label>
                  <Input id="state" name="state" value={form.state} onChange={handleInputChange} placeholder="State" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="zipcode" className="font-semibold text-primary flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Zipcode</label>
                  <Input id="zipcode" name="zipcode" value={form.zipcode} onChange={handleInputChange} placeholder="Zipcode" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="neighborhood" className="font-semibold text-primary flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Neighborhood (optional)</label>
                  <Input id="neighborhood" name="neighborhood" value={form.neighborhood} onChange={handleInputChange} placeholder="Neighborhood (optional)" />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="community" className="font-semibold text-primary flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Community (optional)</label>
                  <Input id="community" name="community" value={form.community} onChange={handleInputChange} placeholder="Community (optional)" />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="subdivision" className="font-semibold text-primary flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Subdivision (optional)</label>
                  <Input id="subdivision" name="subdivision" value={form.subdivision} onChange={handleInputChange} placeholder="Subdivision (optional)" />
                </div>
              </div>
            </div>
            {/* Price, Beds, Baths, Area, Year */}
            <div className="bg-blue-50/40 rounded-xl p-6 mb-2">
              <h2 className="text-xl font-bold mb-6 text-primary flex items-center gap-2"><Ruler className="w-6 h-6 text-primary" /> Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label htmlFor="price" className="font-semibold text-primary flex items-center gap-2"><Ruler className="w-4 h-4 text-primary" /> Price</label>
                  <Input id="price" name="price" value={form.price} onChange={handleInputChange} placeholder="Price" required type="number" min={0} />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="currency" className="font-semibold text-primary flex items-center gap-2"><Ruler className="w-4 h-4 text-primary" /> Currency</label>
                  <Input id="currency" name="currency" value={form.currency} onChange={handleInputChange} placeholder="Currency" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="bedrooms" className="font-semibold text-primary flex items-center gap-2"><BedDouble className="w-4 h-4 text-primary" /> Bedrooms</label>
                  <Input id="bedrooms" name="bedrooms" value={form.bedrooms} onChange={handleInputChange} placeholder="Bedrooms" required type="number" min={0} />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="bathrooms" className="font-semibold text-primary flex items-center gap-2"><Bath className="w-4 h-4 text-primary" /> Bathrooms</label>
                  <Input id="bathrooms" name="bathrooms" value={form.bathrooms} onChange={handleInputChange} placeholder="Bathrooms" required type="number" min={0} />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="livingArea" className="font-semibold text-primary flex items-center gap-2"><Ruler className="w-4 h-4 text-primary" /> Living Area (sqft)</label>
                  <Input id="livingArea" name="livingArea" value={form.livingArea} onChange={handleInputChange} placeholder="Living Area (sqft)" required type="number" min={0} />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="yearBuilt" className="font-semibold text-primary flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Year Built</label>
                  <Input id="yearBuilt" name="yearBuilt" value={form.yearBuilt} onChange={handleInputChange} placeholder="Year Built" required type="number" min={1800} />
                </div>
              </div>
            </div>
            {/* Home Type & Status */}
            <div className="bg-blue-50/40 rounded-xl p-6 mb-2">
              <h2 className="text-xl font-bold mb-6 text-primary flex items-center gap-2"><Home className="w-6 h-6 text-primary" /> Home Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label htmlFor="homeType" className="font-semibold text-primary flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Home Type</label>
                  <Input id="homeType" name="homeType" value={form.homeType} onChange={handleInputChange} placeholder="Home Type (e.g. Single Family)" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="homeStatus" className="font-semibold text-primary flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Status</label>
                  <Input id="homeStatus" name="homeStatus" value={form.homeStatus} onChange={handleInputChange} placeholder="Status (e.g. For Sale)" required />
                </div>
              </div>
            </div>
            {/* Description */}
            <div className="bg-blue-50/40 rounded-xl p-6 mb-2">
              <h2 className="text-xl font-bold mb-6 text-primary flex items-center gap-2"><Ruler className="w-6 h-6 text-primary" /> Description</h2>
              <Textarea className="bg-transparent" name="description" value={form.description} onChange={handleInputChange} placeholder="Description" rows={4} required />
            </div>
            {/* Image Upload */}
            <div className="bg-blue-50/40 rounded-xl p-6 mb-2">
              <h2 className="text-xl font-bold mb-6 text-primary flex items-center gap-2"><UploadCloud className="w-6 h-6 text-primary" /> Upload Images</h2>
              <div className="flex items-center gap-4 mb-2 flex-wrap">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <img src={src} alt={`Preview ${idx + 1}`} className="object-cover w-full h-full" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 hover:bg-red-100">
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:border-blue-600 transition">
                  <UploadCloud className="w-8 h-8 text-blue-400 mb-1" />
                  <span className="text-xs text-gray-500">Add Images</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              <div className="text-xs text-gray-400">You can upload multiple images. First image will be used as cover.</div>
            </div>
            {/* Submit Button */}
            <div className="pt-4">
              <Button type="submit" className="w-full text-lg font-semibold py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 !text-white hover:from-blue-600 hover:via-blue-700 hover:to-blue-800">Upload House</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 