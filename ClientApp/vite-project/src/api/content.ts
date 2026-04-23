/**
 * Content API client - Headless CMS data fetching
 * Calls /api/content/* endpoints
 */

import { apiFetch } from "./API";

export interface TopAlert {
    id: number;
    message: string;
    alertType: string;
    showFromDate: string;
    showToDate: string;
}

export interface ProjectsPageData {
    title: string;
    description?: string;
    heading?: string;
    introText?: string;
    projectDashboardPageUrl?: string;
    url?: string;
    topAlerts: TopAlert[];
}

export interface DashboardPageData {
    title: string;
    description?: string;
    heading?: string;
    instructions?: string;
    columnTitleToDo?: string;
    columnTitleInProgress?: string;
    columnTitleDone?: string;
    projectsPageUrl?: string;
    url?: string;
    topAlerts: TopAlert[];
}

/**
 * Fetch Projects page data from headless API
 */
export async function fetchProjectsPageData(): Promise<ProjectsPageData> {
    const res = await apiFetch("/content/projects-page");
    return await res.json();
}

/**
 * Fetch Dashboard page data from headless API
 */
export async function fetchDashboardPageData(): Promise<DashboardPageData> {
    const res = await apiFetch("/content/dashboard-page");
    return await res.json();
}

/**
 * Fetch currently active top alerts
 */
export async function fetchTopAlerts(): Promise<TopAlert[]> {
    const res = await apiFetch("/content/top-alerts");
    return await res.json();
}
