import axios from "axios";

export const getFilteredServices = async (filters: {
    region?: string;
    city?: string;
    category?: string;
    service?: string;
    }) => {
        const params = new URLSearchParams();

        if (filters.region) params.append("region", filters.region);
        if (filters.city) params.append("city", filters.city);
        if (filters.category) params.append("category", filters.category);
        if (filters.service) params.append("serviceName", filters.service);

        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}services/filtered-find?${params.toString()}&page=1&limit=9`
        );
        
        console.log(filters);
        console.log(params.toString());

        
        return response.data;
    };