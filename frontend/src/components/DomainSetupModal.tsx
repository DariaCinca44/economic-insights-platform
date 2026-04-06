import {useState} from 'react'
import Card from './Card'
import DomainSelect from './DomainSelect'
import {DOMAINS, DEFAULT_DOMAIN, type Domain} from '../config/domains'
import styles from './DomainSetupModal.module.css'

export default function DomainSetupModal({isOpen, onConfirm}: {
    isOpen: boolean,
    onConfirm: (domain: Domain) => void
}) {
    if (!isOpen) return null

    const [selected, setSelected] = useState<Domain>(DEFAULT_DOMAIN)

    return(
       <div className={styles.overlay}>
            <div className={styles.backdrop} />

            <div className={styles.modalContainer}>
                <Card className={styles.cardWrapper}>
                    <div className={styles.title}>Alege domeniul principal de activitate</div>
                    <div className={styles.description}>Pentru a personaliza dashboard-ul, selecteaza un domeniu! Poate fi oricand schimbat din setarile contului.</div>

                    <div className={styles.selectContainer}>
                        <DomainSelect value={selected} onChange={setSelected} options={DOMAINS}/>
                    </div>

                    <button onClick={() => onConfirm(selected)} className={styles.confirmButton}>Confirm</button>
                </Card>
            </div>
       </div>
    )
}