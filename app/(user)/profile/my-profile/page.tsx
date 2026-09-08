"use client";

<<<<<<< HEAD
import { useEffect, useRef, useState } from "react";
=======
>>>>>>> cab42f32d22f95f33d9a8312a15661daf7ddf636
import Image from "next/image";
import { Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

<<<<<<< HEAD
type Profile = {
  id: string; name: string; email: string; phone: string; gender: "male" | "female" | "";
  taxIdentificationNumber: string; taxIdentificationCountry: string; residentialAddress: string; avatarUrl: string | null;
};
const initialProfile: Profile = { id: "", name: "", email: "", phone: "", gender: "", taxIdentificationNumber: "", taxIdentificationCountry: "", residentialAddress: "", avatarUrl: null };
function splitName(name: string) { const [firstName = "", ...lastName] = name.trim().split(/\s+/); return { firstName, lastName: lastName.join(" ") }; }

export default function MyProfilePage() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message ?? "Gagal memuat profil.");
        const loadedProfile = result.data as Profile;
        setProfile(loadedProfile);
        const name = splitName(loadedProfile.name);
        setFirstName(name.firstName); setLastName(name.lastName);
      } catch (error) { alert(error instanceof Error ? error.message : "Gagal memuat profil."); }
      finally { setIsLoading(false); }
    }
    void loadProfile();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    if (!name) return alert("Nama depan wajib diisi.");
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...profile, name }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Gagal menyimpan profil.");
      setProfile(result.data as Profile); alert("Profil berhasil disimpan.");
    } catch (error) { alert(error instanceof Error ? error.message : "Gagal menyimpan profil."); }
    finally { setIsSaving(false); }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData(); formData.append("avatar", file);
      const response = await fetch("/api/profile", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Gagal mengunggah foto.");
      setProfile((current) => ({ ...current, avatarUrl: result.data.avatarUrl }));
    } catch (error) { alert(error instanceof Error ? error.message : "Gagal mengunggah foto."); }
    finally { setIsUploading(false); }
  }

  async function deleteAvatar() {
    setIsUploading(true);
    try {
      const response = await fetch("/api/profile", { method: "DELETE" }); const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Gagal menghapus foto.");
      setProfile((current) => ({ ...current, avatarUrl: null }));
    } catch (error) { alert(error instanceof Error ? error.message : "Gagal menghapus foto."); }
    finally { setIsUploading(false); }
  }

  if (isLoading) return <div className="bg-card rounded-xl p-8 border border-border/20 shadow-sm">Memuat profil...</div>;
  return <div className="bg-card rounded-xl p-8 border border-border/20 shadow-sm">
    <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
      <div className="relative"><div className="w-32 h-32 rounded-full overflow-hidden border-2 border-border/20 relative"><Image src={profile.avatarUrl ?? "/assets/svg/icon-user-profile.svg"} alt="Profile avatar" fill unoptimized className="object-cover" /></div><button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-card hover:bg-primary-600 transition-colors disabled:opacity-50"><Camera className="w-4 h-4" /></button><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" /></div>
      <div className="flex gap-4"><Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} variant="default" className="bg-primary hover:bg-primary-600 text-white rounded-md">{isUploading ? "Uploading..." : "Upload New"}</Button><Button type="button" onClick={deleteAvatar} disabled={!profile.avatarUrl || isUploading} variant="outline" className="bg-muted hover:bg-muted-foreground/20 border-transparent text-foreground rounded-md">Delete avatar</Button></div>
    </div>
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
      <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-foreground">First Name <span className="text-danger">*</span></label><Input placeholder="First name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className="bg-primary-100/30 border-primary-300 focus-visible:ring-primary" /></div>
      <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-foreground">Last Name</label><Input placeholder="Last name" value={lastName} onChange={(event) => setLastName(event.target.value)} /></div>
      <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-foreground">Email</label><Input value={profile.email} type="email" readOnly className="bg-muted text-muted-foreground" /></div>
      <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-foreground">Mobile Number <span className="text-danger">*</span></label><div className="flex"><div className="flex items-center gap-2 px-3 border border-r-0 border-input bg-muted rounded-l-md text-sm"><span className="w-5 h-3 bg-green-600 inline-block" /><span className="text-xs">▼</span></div><Input value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} placeholder="0806 123 7890" className="rounded-l-none" /></div></div>
      <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-foreground">Gender</label><div className="flex gap-4"><label className="flex flex-1 items-center gap-2 border border-input rounded-md px-4 py-2 cursor-pointer hover:bg-muted transition-colors"><input type="radio" name="gender" value="male" checked={profile.gender === "male"} onChange={() => setProfile((current) => ({ ...current, gender: "male" }))} className="accent-primary" /><span className="text-sm">Male</span></label><label className="flex flex-1 items-center gap-2 border border-input rounded-md px-4 py-2 cursor-pointer hover:bg-muted transition-colors"><input type="radio" name="gender" value="female" checked={profile.gender === "female"} onChange={() => setProfile((current) => ({ ...current, gender: "female" }))} className="accent-primary" /><span className="text-sm">Female</span></label></div></div>
      <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-foreground">ID</label><Input value={profile.id} className="bg-muted text-muted-foreground" readOnly /></div>
      <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-foreground">Tax Identification Number</label><Input value={profile.taxIdentificationNumber} onChange={(event) => setProfile((current) => ({ ...current, taxIdentificationNumber: event.target.value }))} placeholder="Tax ID" /></div>
      <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-foreground">Tax Identification Country</label><div className="relative"><select value={profile.taxIdentificationCountry} onChange={(event) => setProfile((current) => ({ ...current, taxIdentificationCountry: event.target.value }))} className="w-full h-10 px-3 border border-input rounded-md bg-transparent appearance-none text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"><option value="">Pilih negara</option><option>Nigeria</option><option>Indonesia</option></select><div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">▼</div><div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-3 bg-green-600" /></div></div>
      <div className="flex flex-col gap-2 md:col-span-2"><label className="text-sm font-semibold text-foreground">Residential Address</label><textarea value={profile.residentialAddress} onChange={(event) => setProfile((current) => ({ ...current, residentialAddress: event.target.value }))} className="w-full min-h-[100px] p-3 border border-input rounded-md text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Ib street orogun ibadan" /></div>
      <div className="md:col-span-2 mt-4"><Button type="submit" disabled={isSaving} variant="default" className="bg-primary hover:bg-primary-600 text-white w-full md:w-auto px-8 rounded-md">{isSaving ? "Saving..." : "Save Changes"}</Button></div>
    </form>
  </div>;
=======
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
>>>>>>> cab42f32d22f95f33d9a8312a15661daf7ddf636
}
