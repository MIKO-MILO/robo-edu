"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="bg-card rounded-xl p-8 border border-border/20 shadow-sm">
      <h2 className="text-xl font-bold font-heading mb-6 text-foreground">Password & Security</h2>
      
      <form className="flex flex-col gap-6 max-w-md">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Current Password <span className="text-danger">*</span>
          </label>
          <Input 
            type="password"
            placeholder="Enter current password" 
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            New Password <span className="text-danger">*</span>
          </label>
          <Input 
            type="password"
            placeholder="Enter new password" 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Confirm New Password <span className="text-danger">*</span>
          </label>
          <Input 
            type="password"
            placeholder="Confirm new password" 
          />
        </div>

        <div className="mt-4">
          <Button variant="default" className="bg-primary hover:bg-primary-600 text-white w-full md:w-auto px-8 rounded-md">
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}
