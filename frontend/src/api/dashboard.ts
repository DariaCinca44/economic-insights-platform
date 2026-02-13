export type DashboardResponse = unknown

export async function fetchDashboard(domain: string): Promise<any> {
    const token= localStorage.getItem('token')
    const response = await fetch(`/api/dashboard?domain=${encodeURIComponent(domain)}`, {
        method: 'GET',
        headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    if (!response.ok) {
        const errorData=await response.json().catch(()=> ({}))
        throw new Error(errorData.description || `Eroare ${response.status}`)
    }
    return response.json()
}