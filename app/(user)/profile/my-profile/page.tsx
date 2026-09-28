"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/user/profile/status-badge";
import { ProfileField } from "@/components/user/profile/profile-field";
import { PhoneField } from "@/components/user/profile/phone-field";
import { GenderField } from "@/components/user/profile/gender-field";
import { SelectField } from "@/components/user/profile/select-field";
import { TextareaField } from "@/components/user/profile/textarea-field";

export default function MyProfilePage() {
  return (
    <div className="bg-card border-2 border-foreground rounded-3xl overflow-hidden p-8">
      {/* Avatar Section */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-secondary neo-shadow relative shrink-0">
          <Image
            src="/assets/images/user_avatar.png"
            alt="Profile avatar"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-3xl font-bold text-foreground leading-tight">
            Goldii
          </h2>
          <StatusBadge label="Member" />
        </div>
      </div>

      {/* Form Fields */}
      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        <ProfileField
          label="First Name"
          required
          placeholder="First name"
          defaultValue="Goldii"
        />
        <ProfileField label="Last Name" required placeholder="Last name" />
        <ProfileField label="Email" placeholder="examples@gmail.com" type="email" />
        <PhoneField label="Mobile Number" required />
        <GenderField />
        <ProfileField
          label="ID"
          placeholder="1559 000 7788 8DER"
          className="bg-muted text-muted-foreground"
          readOnly
        />

        <ProfileField label="Tax Identification Number" placeholder="Tax ID" />

        <SelectField
          label="Tax Identification Country"
          options={["Nigeria", "Indonesia"]}
        />

        <div className="md:col-span-2">
          <TextareaField label="Residential Address" placeholder="Ib street orogun ibadan" />
        </div>

        <div className="md:col-span-2 mt-4">
          <Button
            variant="default"
            className="bg-primary hover:bg-primary-600 text-white w-full md:w-auto px-8 rounded-md"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
