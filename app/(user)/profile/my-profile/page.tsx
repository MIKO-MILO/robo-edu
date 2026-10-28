import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import { ProfileForm, type ProfileData } from "@/components/user/profile/profile-form";

export const metadata = {
  title: "Profil Saya | RoboEdu",
};

export default async function MyProfilePage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=%2Fprofile%2Fmy-profile");

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      gender: users.gender,
      taxIdentificationNumber: users.taxIdentificationNumber,
      taxIdentificationCountry: users.taxIdentificationCountry,
      residentialAddress: users.residentialAddress,
      avatarKey: users.avatarKey,
      role: users.role,
      resellerStatus: users.resellerStatus,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || !user.isActive) redirect("/login?next=%2Fprofile%2Fmy-profile");

  const profileData: ProfileData = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    gender: user.gender ?? "",
    taxIdentificationNumber: user.taxIdentificationNumber ?? "",
    taxIdentificationCountry: user.taxIdentificationCountry ?? "",
    residentialAddress: user.residentialAddress ?? "",
    // Avatar served through the API route so MinIO credentials stay server-side
    avatarUrl: user.avatarKey ? `/api/profile/avatar?t=${Date.now()}` : null,
    role: user.role,
    resellerStatus: user.resellerStatus,
  };

  return <ProfileForm initialData={profileData} />;
}
