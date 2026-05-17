import css from './Header.module.css';
import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className={css.header}>

            <img src="/logo_Header.png" alt="Maintenance Logo" className={css.logo} />

            <Link to="/" className={css.botaoLogin}>
                Login
            </Link>
        </header>
    );
}
