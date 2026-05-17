import { useState, useEffect } from "react";
import css from './DashboardProfessor.module.css';
import Footer from "../../Components/Footer/Footer.jsx";
import Header from "../../Components/Header/Header.jsx";
import { useNavigate } from "react-router-dom";

export default function DashboardProfessor() {
    const [usuario, setUsuario] = useState(null);
    const [erro, setErro] = useState('');

    const navigate = useNavigate();
    const idUsuario = localStorage.getItem('id_usuario');

    useEffect(() => {
        if (!idUsuario) { navigate('/'); return; }

        async function carregarUsuario() {
            try {
                const resposta = await fetch(`http://192.168.1.102:5000/buscar_usuarios/${idUsuario}`, {
                    credentials: 'include',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const dados = await resposta.json();
                if (resposta.ok) setUsuario(dados.usuario);
                else setErro("Não foi possível carregar os dados.");
            } catch {
                setErro("Erro de conexão com o servidor.");
            }
        }

        carregarUsuario();
    }, [idUsuario]);

    useEffect(() => {
        if (!erro) return;
        const t = setTimeout(() => setErro(''), 8000);
        return () => clearTimeout(t);
    }, [erro]);

    async function fazerLogout() {
        try {
            await fetch('http://192.168.1.102:5000/logout', { method: 'POST', credentials: 'include' });
        } catch {}
        localStorage.removeItem('id_usuario');
        localStorage.removeItem('token');
        navigate('/');
    }

    return (
        <div className={css.pagina}>
            <Header />

            <main className={css.secao}>
                {erro && (
                    <div className={`${css.toast} ${css.toastErro}`}>
                        <span>{erro}</span>
                    </div>
                )}

                <div className={css.barra}>
                    <p className={css.saudacao}>
                        olá, <span className={css.nome}>{usuario?.nome || ''}!</span>
                    </p>
                    <div className={css.botoes}>
                        <button className={css.btnAzul} onClick={() => navigate('/editar-perfil')}>
                            Editar Perfil
                        </button>
                        <button className={css.btnAzulClaro} onClick={fazerLogout}>
                            logout
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
