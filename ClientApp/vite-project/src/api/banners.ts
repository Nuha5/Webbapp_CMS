import { apiFetch } from "./API";

export interface Banner {
    title?: string;
    message?: string;
    bannerType: "info" | "warning" | "success";
    showStartDate: string;
    showEndDate?: string;
    daysBeforeToShow: number;
}

export async function getBanners(): Promise<Banner[]> {
    try {
        const res = await apiFetch("/banners");
        const data = await res.json();

        // Konvertera från PascalCase (API) till camelCase (TypeScript)
        return Array.isArray(data)
            ? data.map((b: any) => ({
                title: b.title || b.Title,
                message: b.message || b.Message,
                bannerType: (b.bannerType || b.BannerType || "info").toLowerCase() as "info" | "warning" | "success",
                showStartDate: b.showStartDate || b.ShowStartDate,
                showEndDate: b.showEndDate || b.ShowEndDate,
                daysBeforeToShow: b.daysBeforeToShow || b.DaysBeforeToShow || 0,
            }))
            : [];
    } catch (error) {
        console.error("Failed to fetch banners:", error);
        return [];
    }
}
