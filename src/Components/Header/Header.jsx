import css from './Header.module.css';
import { Link } from "react-router-dom";

const BASE_URL = 'http://10.92.3.147:5000';

export default function Header() {

    // Pega o id do usuário salvo no navegador
    const idUsuario = localStorage.getItem('id_usuario');

    // Se tiver id salvo, o usuário está logado
    const estaLogado = !!idUsuario;

    // URL da foto de perfil do usuário
    const fotoUrl = `${BASE_URL}/uploads/Usuarios/${idUsuario}.jpeg`;

    return (
        <header className={css.header}>

            <img src="/logo_Header.png" alt="Maintenance Logo" className={css.logo} />

            {/* Se estiver logado, mostra a foto. Se não, mostra o botão de login */}
            {estaLogado ? (
                <img
                    src={fotoUrl}
                    alt="Foto de perfil"
                    className={css.fotoPerfil}
                />
            ) : (
                <Link to="/" className={css.botaoLogin}>
                    Login
                </Link>
            )}

        </header>
    );
}
