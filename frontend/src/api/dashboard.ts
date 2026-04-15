export interface DataPoint{
    date: string;
    value: number;
}

export interface DomainData{
    domain: string;
    label: string;
    charts : {
        inflation: DataPoint[];
        consumption: DataPoint[];
        trends: DataPoint[];
        prices: DataPoint[];
        correlation: DataPoint[];
    }
}

export interface DashboardResponse{
    data: DomainData[];
}

export async function fetchUserDomains(): Promise<{id: string, label: string}[]> {
    const res = await fetch('/api/user-domains', {
        headers:{
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    if(!res.ok){
        throw new Error('Failed to fetch dashboard data')
    }

    const json = await res.json();
    return json.domains;
}

export async function fetchDomainData(domainId: string): Promise<DomainData> {
    const res = await fetch(`/api/domain-data?domain=${domainId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (!res.ok) {
        throw new Error(`Nu am putut incarca datele pentru ${domainId}`);
    }
    
    return res.json();
}