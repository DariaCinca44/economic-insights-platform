export type DashboardResponse = unknown

export async function fetchDashboard(domain: string): Promise<DashboardResponse> {
    const response = await fetch(`/api/dashboard?domain=${encodeURIComponent(domain)}`)
    if (!response.ok) {
        const text=await response.text()
        throw new Error(`API error ${response.status}: ${text}`)
    }
    return response.json()
}