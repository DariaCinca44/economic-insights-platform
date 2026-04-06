export type Domain = | 'CP01' | 'CP02' | 'CP03' | 'CP04' | 'CP05' | 'CP06' | 'CP07' | 'CP08' | 'CP09' | 'CP10' | 'CP11' | 'CP12';

export const DOMAINS: Array<{id: Domain, label: string}> = [
    {id: 'CP01', label: 'Alimente si bauturi nealcoolice'},
    {id: 'CP02', label: 'Bauturi alcoolice si tutun'},
    {id: 'CP03', label: 'Imbracaminte, incaltaminte si accesorii'},   
    {id: 'CP04', label: 'Locuinta, apa, electricitate, gaze'},
    {id: 'CP05', label: 'Mobilier si echipament casnic'},
    {id: 'CP06', label: 'Sanatate'},
    {id: 'CP07', label: 'Transport'},
    {id: 'CP08', label: 'Comunicatii'},
    {id: 'CP09', label: 'Recreere si cultura'},
    {id: 'CP10', label: 'Educatie'},
    {id: 'CP11', label: 'Restaurante si hoteluri'},
    {id: 'CP12', label: 'Diverse bauturi si servicii'},
]

export const DEFAULT_DOMAIN: Domain ='CP01';