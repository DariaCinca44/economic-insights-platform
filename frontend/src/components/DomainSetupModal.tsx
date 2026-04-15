import {useState, useEffect, useRef} from 'react'
import {DOMAINS} from '../config/domains'
import styles from './DomainSetupModal.module.css'
import {motion, AnimatePresence} from 'framer-motion'
import {Check, ChevronDown} from 'lucide-react'

function SmoothDropdown({ value, onChange, options, placeholder, disabledValue = "" }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find((o: any) => o.id === value)?.label || placeholder;

    return (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
                type="button"
                className={`${styles.dropdownTrigger} ${isOpen ? styles.dropdownTriggerFocus : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={{ opacity: value ? 1 : 0.6 }}>{selectedLabel}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={styles.dropdownMenu}
                    >
                        {options.map((option: any) => {
                            const isDisabled = option.id === disabledValue;
                            return (
                                <div
                                    key={option.id}
                                    className={`${styles.dropdownItem} ${isDisabled ? styles.dropdownItemDisabled : ''}`}
                                    onClick={() => {
                                        if (!isDisabled) {
                                            onChange(option.id);
                                            setIsOpen(false);
                                        }
                                    }}
                                >
                                    {option.label}
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
interface Props {
    onConfirm? : (domain:string) => void;
    onComplete?: () => void;
}

export default function DomainSetupModal({onConfirm, onComplete}: Props) {
    
    const [accountType, setAccountType] = useState<"fizic" | "juridic">("fizic")

    const [isAllSelected, setIsAllSelected] = useState(false);
    const [primaryDomain, setPrimaryDomain] = useState("");
    const [secondaryDomains, setSecondaryDomains] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedType = localStorage.getItem('accountType');
        if (savedType === "juridic"){
            setAccountType("juridic");
        }
    }, [])

    const handleAddSecondary = () => {
        setSecondaryDomains([...secondaryDomains, ""]);
    }

    const handleUpdateSecondary = (index: number, value: string) => {
        const newSec = [...secondaryDomains];
        newSec[index] = value;
        setSecondaryDomains(newSec);
    }

    const handleRemoveSecondary = (index: number) => {
        const newSec = secondaryDomains.filter((_, i) => i !== index);
        setSecondaryDomains(newSec);
    }

    const handleSubmit = async() => {
        if (!isAllSelected && !primaryDomain) {
            alert("Selecteaza un domeniu principal");
            return;
        }
        setLoading(true);

        try{
            const finalPrimary = isAllSelected? DOMAINS[0].id: primaryDomain;
            localStorage.setItem("domain", finalPrimary);

            const validSecondaries = secondaryDomains.filter(d => d.trim() !== "");
            localStorage.setItem("secondaryDomains", JSON.stringify(validSecondaries));
            localStorage.setItem("isAllDomains", isAllSelected ? "true" : "false");

            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    primaryDomain: finalPrimary,
                    secondaryDomains: validSecondaries,
                    isAllDomains: isAllSelected
                })
            })

            if(!res.ok){
                throw new Error("Failed to save domains");
            }

            if (onConfirm){
                onConfirm(finalPrimary);
            } else if (onComplete){
                onComplete();
            } else {
                window.location.reload();
            }
        } catch (error){
            console.error("Eroare la salvarea domeniilor:", error);
            alert("A aparut o eroare. Incearca din nou.");
            setLoading(false);
        }
    }

    const isSubmitDisabled = !isAllSelected && primaryDomain === "";

    return(
       <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>

            <div className={styles.header}>
                <h2 className= {styles.title}>
                    {accountType === "juridic" ? 'Profilul Companiei' : 'Preferinte Analiza'}
                </h2>
                <p className = {styles.description}>
                    {accountType === "juridic" ? 'Selecteaza domeniile de activitate pentru compania ta' : 'Selecteaza domeniile de interes pentru analiza ta'}
                </p>         
            </div>

           {accountType === "fizic" && (
                    <div 
                        className={styles.smoothCheckboxContainer} 
                        onClick={() => {
                            const newValue = !isAllSelected;
                            setIsAllSelected(newValue);
                            if (newValue) {
                                setPrimaryDomain("");
                                setSecondaryDomains([]);
                            }
                        }}
                    >
                        <motion.div
                            className={styles.customBox}
                            animate={{ backgroundColor: isAllSelected ? "#8b5cf6" : "transparent" }}
                        >
                            <AnimatePresence>
                                {isAllSelected && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <Check size={14} color="white" strokeWidth={3} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                        <span className={styles.checkboxLabel}>Toate domeniile</span>
                    </div>
                )}

            {!isAllSelected && (
                <div className= {styles.domainsWrapper}>
                    <div className = {styles.formGroup}>
                        <label>Domeniu principal (Obligatoriu)</label>
                        <SmoothDropdown 
                                value={primaryDomain} 
                                onChange={setPrimaryDomain} 
                                options={DOMAINS} 
                                placeholder="Selecteaza domeniul principal..." 
                            />
                    </div>
                    
                    <div className = {styles.formGroup}>
                        <label>Domenii secundare (Optional)</label>
                        {secondaryDomains.map((secDomain, index) => (
                            <div key={index} className={styles.secondaryRow}>
                                <SmoothDropdown 
                                        value={secDomain} 
                                        onChange={(val: string) => handleUpdateSecondary(index, val)} 
                                        options={DOMAINS} 
                                        placeholder="Selecteaza domeniul secundar..."
                                        disabledValue={primaryDomain} 
                                    />
                                <button className={styles.removeBtn} onClick={() => handleRemoveSecondary(index)} title="Sterge domeniul secundar">X</button>
                            </div>
                        ))}

                        <button className={styles.addBtn} onClick={handleAddSecondary}> + Adauga domeniu secundar</button>
                    </div>
                </div>
            )}
            <button className = {styles.confirmBtn} onClick={handleSubmit} disabled={isSubmitDisabled || loading}>
                {loading ? "Salvare..." : "Salveaza preferintele"}
            </button>
       </div>
    </div>
    )
}