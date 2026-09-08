"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MyProfilePage() {
  return (
    <div className="bg-card rounded-xl p-8 border border-border/20 shadow-sm">
      {/* Avatar Section */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-border/20 relative">
            <Image
              src="/assets/images/user_avatar.png"
              alt="Profile avatar"
              fill
              className="object-cover"
            />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-card hover:bg-primary-600 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-4">
          <Button variant="default" className="bg-primary hover:bg-primary-600 text-white rounded-md">
            Upload New
          </Button>
          <Button variant="outline" className="bg-muted hover:bg-muted-foreground/20 border-transparent text-foreground rounded-md">
            Delete avatar
          </Button>
        </div>
      </div>

      {/* Form Fields */}
      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            First Name <span className="text-danger">*</span>
          </label>
          <Input 
            placeholder="First name" 
            defaultValue="Goldii"
            className="bg-primary-100/30 border-primary-300 focus-visible:ring-primary" 
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Last Name <span className="text-danger">*</span>
          </label>
          <Input placeholder="Last name" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Email
          </label>
          <Input placeholder="examples@gmail.com" type="email" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Mobile Number <span className="text-danger">*</span>
          </label>
          <div className="flex">
            <div className="flex items-center gap-2 px-3 border border-r-0 border-input bg-muted rounded-l-md text-sm">
              <span className="w-5 h-3 bg-green-600 inline-block"></span>
              <span className="text-xs">▼</span>
            </div>
            <Input placeholder="0806 123 7890" className="rounded-l-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Gender
          </label>
          <div className="flex gap-4">
            <label className="flex flex-1 items-center gap-2 border border-input rounded-md px-4 py-2 cursor-pointer hover:bg-muted transition-colors">
              <input type="radio" name="gender" value="male" className="accent-primary" />
              <span className="text-sm">Male</span>
            </label>
            <label className="flex flex-1 items-center gap-2 border border-input rounded-md px-4 py-2 cursor-pointer hover:bg-muted transition-colors">
              <input type="radio" name="gender" value="female" className="accent-primary" />
              <span className="text-sm">Female</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            ID
          </label>
          <Input placeholder="1559 000 7788 8DER" className="bg-muted text-muted-foreground" readOnly />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Tax Identification Number
          </label>
          <Input placeholder="Tax ID" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Tax Identification Country
          </label>
          <div className="relative">
            <select className="w-full h-10 px-3 border border-input rounded-md bg-transparent appearance-none text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option>Nigeria</option>
              <option>Indonesia</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              ▼
            </div>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-3 bg-green-600"></div>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-semibold text-foreground">
            Residential Address
          </label>
          <textarea 
            className="w-full min-h-[100px] p-3 border border-input rounded-md text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Ib street orogun ibadan"
          />
        </div>

        <div className="md:col-span-2 mt-4">
          <Button variant="default" className="bg-primary hover:bg-primary-600 text-white w-full md:w-auto px-8 rounded-md">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
