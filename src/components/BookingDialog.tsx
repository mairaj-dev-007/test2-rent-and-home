"use client";
import React, { useState, useEffect } from "react";
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import toast from 'react-hot-toast';

export default function BookingDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update name when session becomes available
  useEffect(() => {
    if (session?.user?.name && !name) {
      setName(session.user.name);
    }
  }, [session?.user?.name, name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !name || !phone) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success(`Tour booked for ${date.toLocaleString()} by ${name}`);
      setOpen(false);
      setDate(undefined);
      setName("");
      setPhone("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">Book a Tour</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm w-full !z-1000">
        <DialogHeader>
          <DialogTitle>Book a Property Tour</DialogTitle>
          <DialogDescription>Select your preferred date and time, and provide your contact info.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="mb-1 block">Date & Time</Label>
            <DateTimePicker hourCycle={12} value={date} onChange={setDate} className="w-full" />
          </div>
          <div>
            <Label className="mb-1 block">Email</Label>
            <Input value={session?.user?.email || ""} disabled className="blur-[0.5px] bg-gray-50 text-gray-900 select-none" />
          </div>
          <div>
            <Label className="mb-1 block">Full Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" required />
          </div>
          <div>
            <Label className="mb-1 block">Phone Number</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" required />
          </div>
          
          {/* Booking Summary */}
          {(date || name || phone) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-blue-900">Booking Summary</h4>
              <div className="text-sm text-blue-800 space-y-1">
                {date && (
                  <p><span className="font-medium">Date & Time:</span> {date.toLocaleString()}</p>
                )}
                {name && (
                  <p><span className="font-medium">Name:</span> {name}</p>
                )}
                {phone && (
                  <p><span className="font-medium">Phone:</span> {phone}</p>
                )}
                {session?.user?.email && (
                  <p><span className="font-medium">Email:</span> {session.user.email}</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-row gap-2">
            <Button type="submit" onClick={handleSubmit} className="w-1/2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white" disabled={isSubmitting}>{isSubmitting ? "Booking..." : "Book Tour"}</Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-1/2">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 