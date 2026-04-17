import { useState, useEffect } from "react";

export const usePinnedGraphs = () => {
    const [pinnedGraphs, setPinnedGraphs] = useState<string[]>(() => {
        const saved = localStorage.getItem("pinnedGraphs");
        return saved ? JSON.parse(saved) : [];
    })

    useEffect(() => {
        localStorage.setItem("pinnedGraphs", JSON.stringify(pinnedGraphs));
    }, [pinnedGraphs]);

    const togglePin = (id: string) => {
        setPinnedGraphs((prev) => 
            prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]); 
    }

    return { pinnedGraphs, togglePin };
}