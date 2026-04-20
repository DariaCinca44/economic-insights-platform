import { useState, useEffect} from "react";

export const usePinnedGraphs = () => {
    const [pinnedGraphs, setPinnedGraphs] = useState<string[]>([]);
    const [isLoadingPins, setIsLoadingPins] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchPins(){
            try{
                const token = sessionStorage.getItem('token');
                const res = await fetch("/api/pinned-graphs", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (isMounted && data.pinned_graphs) {
                        setPinnedGraphs(data.pinned_graphs);
                    }
                }
            } catch (error){
                console.error("Eroare la aducerea pinurilor de pe server:", error);
            } finally {
                if (isMounted) setIsLoadingPins(false);
            }
        }

        fetchPins();
        return () => { isMounted = false }
    }, []);

    const togglePin = async (id: string) => {
            let newPinned : string[];
            const isPinned = pinnedGraphs.includes(id);

            if (isPinned) {
                newPinned = pinnedGraphs.filter(g => g !== id);
            } else {
                if(pinnedGraphs.length >= 4){
                    alert("Poți avea maxim 4 grafice fixate. Debifeaza unul pentru a fixa altul.");
                    return;
                }
                newPinned = [...pinnedGraphs, id];
            }
            setPinnedGraphs(newPinned);

            try{
                const token = sessionStorage.getItem('token');
                await fetch("/api/pinned-graphs", {
                    method: "POST",
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ pinned_graphs: newPinned })
                });
            } catch(error){
                console.error("Eroare la actualizarea pinurilor pe server:", error);
                setPinnedGraphs(pinnedGraphs);
                alert("A apărut o eroare la salvarea preferințelor. Te rog să încerci din nou.");
            }
        } 
    return { pinnedGraphs, togglePin, isLoadingPins};
}