"use client";
import React, { useState } from "react";
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
  const [name, setName] = useState(session?.user?.name || "");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            <Input value={session?.user?.email || ""} disabled className="blur-[1px] bg-gray-50 text-gray-700 select-none" />
          </div>
          <div>
            <Label className="mb-1 block">Full Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" required />
          </div>
          <div>
            <Label className="mb-1 block">Phone Number</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" required />
          </div>
          <DialogFooter className="flex flex-row gap-2">
            <Button type="submit" onClick={handleSubmit} className="w-1/2" disabled={isSubmitting}>{isSubmitting ? "Booking..." : "Book Tour"}</Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-1/2">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 