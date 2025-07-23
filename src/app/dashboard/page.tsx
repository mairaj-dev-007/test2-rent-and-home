"use client";

import * as React from "react";
import { useEffect, useState, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { MoreHorizontal, Pencil, Trash2, Loader2, Plus, Home, BedDouble, Bath, Ruler, Calendar, UploadCloud, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface House {
  id: string;
  zpid?: number | null;
  streetAddress: string;
  city: string;
  state: string;
  zipcode: string;
  price: number;
  homeStatus: string;
  homeType: string;
  createdAt: string;
  bedrooms: number;
  bathrooms: number;
  livingArea: number;
  description: string;
  currency: string;
  yearBuilt: number;
  neighborhood?: string | null;
  community?: string | null;
  subdivision?: string | null;
  longitude: number;
  latitude: number;
  datePostedString: string;
}

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
  zpid?: string;
  longitude: string;
  latitude: string;
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
  homeStatus: "FOR_SALE",
  description: "",
  currency: "USD",
  zpid: "",
  longitude: "0",
  latitude: "0",

};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = React.useState<House[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingHouse, setEditingHouse] = React.useState<House | null>(null);
  const [deletingHouse, setDeletingHouse] = React.useState<House | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [addForm, setAddForm] = React.useState<HouseForm>(initialForm);
  const [images, setImages] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch user's houses
  useEffect(() => {
    if (status === "authenticated") {
      fetchUserHouses();
    }
  }, [status, searchTerm]);

  const fetchUserHouses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      
      const response = await fetch(`/api/user/houses?${params.toString()}`);
      const result = await response.json();
      
      if (response.ok) {
        setData(result.data || []);
      } else {
        console.error('Failed to fetch houses:', result.error);
      }
    } catch (error) {
      console.error('Error fetching houses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
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

  const handleAddHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/houses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...addForm,
          price: parseFloat(addForm.price),
          bedrooms: parseInt(addForm.bedrooms),
          bathrooms: parseInt(addForm.bathrooms),
          livingArea: parseInt(addForm.livingArea),
          yearBuilt: parseInt(addForm.yearBuilt),
          zpid: addForm.zpid ? parseInt(addForm.zpid) : null,
          longitude: parseFloat(addForm.longitude),
          latitude: parseFloat(addForm.latitude),
        }),
      });

      if (response.ok) {
        setShowAddForm(false);
        setAddForm(initialForm);
        setImages([]);
        setImagePreviews([]);
        fetchUserHouses(); // Refresh the data
      } else {
        const error = await response.json();
        alert(`Error adding house: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding house:', error);
      alert('Failed to add house');
    }
  };

  const handleEdit = async (house: House, formData: FormData) => {
    try {
      const response = await fetch(`/api/houses/${house.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streetAddress: formData.get('streetAddress'),
          city: formData.get('city'),
          state: formData.get('state'),
          zipcode: formData.get('zipcode'),
          price: parseFloat(formData.get('price') as string),
          homeType: formData.get('homeType'),
          bedrooms: parseInt(formData.get('bedrooms') as string),
          bathrooms: parseInt(formData.get('bathrooms') as string),
          livingArea: parseInt(formData.get('livingArea') as string),
          yearBuilt: parseInt(formData.get('yearBuilt') as string),
          description: formData.get('description'),
          homeStatus: formData.get('homeStatus'),
          zpid: formData.get('zpid') ? parseInt(formData.get('zpid') as string) : null,
          currency: formData.get('currency'),
          longitude: parseFloat(formData.get('longitude') as string),
          latitude: parseFloat(formData.get('latitude') as string),
        }),
      });

      if (response.ok) {
        setEditingHouse(null);
        fetchUserHouses(); // Refresh the data
      } else {
        const error = await response.json();
        alert(`Error updating house: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating house:', error);
      alert('Failed to update house');
    }
  };

  const handleDelete = async (house: House) => {
    try {
      const response = await fetch(`/api/houses/${house.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeletingHouse(null);
        fetchUserHouses(); // Refresh the data
      } else {
        const error = await response.json();
        alert(`Error deleting house: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting house:', error);
      alert('Failed to delete house');
    }
  };

  const columns: ColumnDef<House>[] = [
    {
      accessorKey: "streetAddress",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Address
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div>
          <div className="font-semibold">{row.original.streetAddress}</div>
          <div className="text-xs text-gray-500">
            {row.original.city}, {row.original.state} {row.original.zipcode}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Price
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium text-blue-700">
          {row.original.currency} {row.original.price.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "homeStatus",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Status
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <span className="capitalize text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700">
          {row.original.homeStatus.replace("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "homeType",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Type
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => <span>{row.original.homeType}</span>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Created
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {/* Edit Dialog */}
          <Dialog open={editingHouse?.id === row.original.id} onOpenChange={open => open ? setEditingHouse(row.original) : setEditingHouse(null)}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Edit">
                <Pencil className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-[90vw] !w-full max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit House</DialogTitle>
                <DialogDescription>Edit the details and save changes.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleEdit(row.original, formData);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium mb-1">Street Address</label>
                  <Input name="streetAddress" defaultValue={row.original.streetAddress} required />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">City</label>
                    <Input name="city" defaultValue={row.original.city} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">State</label>
                    <Input name="state" defaultValue={row.original.state} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Zip</label>
                    <Input name="zipcode" defaultValue={row.original.zipcode} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Price</label>
                    <Input name="price" type="number" defaultValue={row.original.price} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Type</label>
                    <Input name="homeType" defaultValue={row.original.homeType} required />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Bedrooms</label>
                    <Input name="bedrooms" type="number" defaultValue={row.original.bedrooms} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Bathrooms</label>
                    <Input name="bathrooms" type="number" defaultValue={row.original.bathrooms} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Living Area</label>
                    <Input name="livingArea" type="number" defaultValue={row.original.livingArea} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Year Built</label>
                    <Input name="yearBuilt" type="number" defaultValue={row.original.yearBuilt} required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Status</label>
                  <select name="homeStatus" defaultValue={row.original.homeStatus} className="w-full p-2 border rounded-md">
                    <option value="FOR_SALE">For Sale</option>
                    <option value="FOR_RENT">For Rent</option>
                    <option value="SOLD">Sold</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">ZPID (optional)</label>
                    <Input name="zpid" type="number" defaultValue={row.original.zpid || ''} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Currency</label>
                    <Input name="currency" defaultValue={row.original.currency} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Longitude</label>
                    <Input name="longitude" type="number" step="any" defaultValue={row.original.longitude} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Latitude</label>
                    <Input name="latitude" type="number" step="any" defaultValue={row.original.latitude} required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Description</label>
                  <textarea name="description" defaultValue={row.original.description} className="w-full p-2 border rounded-md h-20" />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {/* Delete AlertDialog */}
          <AlertDialog open={deletingHouse?.id === row.original.id} onOpenChange={open => open ? setDeletingHouse(row.original) : setDeletingHouse(null)}>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Delete">
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete House</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this house? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(row.original)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Listings</h1>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add House
            </Button>
          </DialogTrigger>
          <DialogContent className="!max-w-[90vw] !w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New House</DialogTitle>
              <DialogDescription>Fill in the details to add a new house listing.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddHouse} className="space-y-6">
              {/* Address Fields */}
              <div className="bg-blue-50/40 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6 text-primary flex items-center gap-2"><Home className="w-6 h-6 text-primary" /> Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="streetAddress" className="font-semibold text-primary flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Street Address</label>
                    <Input id="streetAddress" name="streetAddress" value={addForm.streetAddress} onChange={handleInputChange} placeholder="Street Address" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="city" className="font-semibold text-primary flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> City</label>
                    <Input id="city" name="city" value={addForm.city} onChange={handleInputChange} placeholder="City" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="state" className="font-semibold text-primary flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> State</label>
                    <Input id="state" name="state" value={addForm.state} onChange={handleInputChange} placeholder="State" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="zipcode" className="font-semibold text-primary flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Zipcode</label>
                    <Input id="zipcode" name="zipcode" value={addForm.zipcode} onChange={handleInputChange} placeholder="Zipcode" required />
                  </div>
                </div>
              </div>
              {/* Property Details */}
              <div className="bg-blue-50/40 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6 text-primary flex items-center gap-2"><Ruler className="w-6 h-6 text-primary" /> Property Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="price" className="font-semibold text-primary flex items-center gap-2"><Ruler className="w-4 h-4 text-primary" /> Price</label>
                    <Input id="price" name="price" value={addForm.price} onChange={handleInputChange} placeholder="Price" required type="number" min={0} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="currency" className="font-semibold text-primary flex items-center gap-2"><Ruler className="w-4 h-4 text-primary" /> Currency</label>
                    <Input id="currency" name="currency" value={addForm.currency} onChange={handleInputChange} placeholder="Currency" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="bedrooms" className="font-semibold text-primary flex items-center gap-2"><BedDouble className="w-4 h-4 text-primary" /> Bedrooms</label>
                    <Input id="bedrooms" name="bedrooms" value={addForm.bedrooms} onChange={handleInputChange} placeholder="Bedrooms" required type="number" min={0} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="bathrooms" className="font-semibold text-primary flex items-center gap-2"><Bath className="w-4 h-4 text-primary" /> Bathrooms</label>
                    <Input id="bathrooms" name="bathrooms" value={addForm.bathrooms} onChange={handleInputChange} placeholder="Bathrooms" required type="number" min={0} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="livingArea" className="font-semibold text-primary flex items-center gap-2"><Ruler className="w-4 h-4 text-primary" /> Living Area (sqft)</label>
                    <Input id="livingArea" name="livingArea" value={addForm.livingArea} onChange={handleInputChange} placeholder="Living Area (sqft)" required type="number" min={0} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="yearBuilt" className="font-semibold text-primary flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Year Built</label>
                    <Input id="yearBuilt" name="yearBuilt" value={addForm.yearBuilt} onChange={handleInputChange} placeholder="Year Built" required type="number" min={1800} />
                  </div>
                </div>
              </div>
              {/* Home Info */}
              <div className="bg-blue-50/40 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6 text-primary flex items-center gap-2"><Home className="w-6 h-6 text-primary" /> Home Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="homeType" className="font-semibold text-primary flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Home Type</label>
                    <Input id="homeType" name="homeType" value={addForm.homeType} onChange={handleInputChange} placeholder="Home Type (e.g. Single Family)" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="homeStatus" className="font-semibold text-primary flex items-center gap-2"><Home className="w-4 h-4 text-primary" /> Status</label>
                    <select name="homeStatus" value={addForm.homeStatus} onChange={handleInputChange} className="w-full p-2 border rounded-md">
                      <option value="FOR_SALE">For Sale</option>
                      <option value="FOR_RENT">For Rent</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Additional Details */}
              <div className="bg-blue-50/40 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6 text-primary flex items-center gap-2"><Ruler className="w-6 h-6 text-primary" /> Additional Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="zpid" className="font-semibold text-primary flex items-center gap-2"><Ruler className="w-4 h-4 text-primary" /> ZPID (optional)</label>
                    <Input id="zpid" name="zpid" value={addForm.zpid} onChange={handleInputChange} placeholder="ZPID" type="number" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="longitude" className="font-semibold text-primary flex items-center gap-2"><Ruler className="w-4 h-4 text-primary" /> Longitude</label>
                    <Input id="longitude" name="longitude" value={addForm.longitude} onChange={handleInputChange} placeholder="Longitude" type="number" step="any" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="latitude" className="font-semibold text-primary flex items-center gap-2"><Ruler className="w-4 h-4 text-primary" /> Latitude</label>
                    <Input id="latitude" name="latitude" value={addForm.latitude} onChange={handleInputChange} placeholder="Latitude" type="number" step="any" required />
                  </div>

                </div>
              </div>
              {/* Description */}
              <div className="bg-blue-50/40 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6 text-primary flex items-center gap-2"><Ruler className="w-6 h-6 text-primary" /> Description</h2>
                <Textarea className="bg-transparent" name="description" value={addForm.description} onChange={handleInputChange} placeholder="Description" rows={4} required />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Add House</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mb-4 flex items-center gap-4">
        <Input
          placeholder="Search address..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No houses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
