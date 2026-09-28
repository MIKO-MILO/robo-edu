"use client";

import { Button } from "@/components/ui/button";
import { ProfileField } from "@/components/user/profile/profile-field";

export default function SettingsPage() {
  return (
    <div className="bg-card border-2 border-foreground rounded-3xl overflow-hidden p-8">
      <h2 className="text-xl font-bold font-heading mb-6 text-foreground">
        Password &amp; Security
      </h2>

      <form className="flex flex-col gap-6 max-w-md">
        <ProfileField
          label="Current Password"
          required
          type="password"
          placeholder="Enter current password"
        />

        <ProfileField
          label="New Password"
          required
          type="password"
          placeholder="Enter new password"
        />

        <ProfileField
          label="Confirm New Password"
          required
          type="password"
          placeholder="Confirm new password"
        />

        <div className="mt-4">
          <Button
            variant="default"
            className="bg-primary hover:bg-primary-600 text-white w-full md:w-auto px-8 rounded-md"
          >
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}
