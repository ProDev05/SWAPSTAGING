import styles from './Preloader.module.css';

export default function Preloader() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.preloader}>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    )
}