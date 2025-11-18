export interface IServiceOrder {
  id: string;
  status: "paid" | "accepted" | "completed" | "cancelled";
  createdAt: string;

  address?: {
    id: string;
    name: string;
    address: string;
    neighborhood?: string;
    buildingType?: string;
    lat: number | string;
    lng: number | string;
    city?: { id: string; name: string };
    region?: { id: string; name: string };
    country?: { id: string; name: string };
    comments?: string;
    status?: boolean;
  };

  service?: {
    id?: string;
    name: string;
    description?: string;
    photos?: string[] | null;
  };

  provider: {
    id: string;
    names: string;
    surnames: string;
    email: string;
    phone: string;
    profilePicture?: string;
  };

  payments?: {
    amount: string;
    status: string;
  }[];
}
