"use client";

import { AuthProvider } from "../../hooks/useAuth";
import { AppProvider } from "../../hooks/useApp";
import PropertyDetail from "../../components/PropertyDetail";
import { useRouter } from "next/navigation";

interface Props {
  propertyId: string;
}

export default function PropertyPageClient({ propertyId }: Props) {
  const router = useRouter();

  return (
    <AuthProvider>
      <AppProvider>
        <PropertyDetail
          propertyId={propertyId}
          onBack={() => router.push("/")}
        />
      </AppProvider>
    </AuthProvider>
  );
}
