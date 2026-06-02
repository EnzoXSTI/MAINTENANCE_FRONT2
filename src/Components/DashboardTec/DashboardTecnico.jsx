import { useState, useEffect } from "react";
import css from './DashboardTecnico.module.css';
import { useNavigate } from "react-router-dom";
import ListaChamados from "../ListaChamado/ListaChamados.jsx";
import CadastroChamado from "../CadastroChamado/CadastroChamado.jsx";

export default function DashboardTecnico() {
    const [usuario, setUsuario] = useState(null);
    const [erro, setErro] = useState('');

    const navigate = useNavigate();
    const idUsuario = localStorage.getItem('id_usuario');
    const token = localStorage.getItem('token');

    // Redireciona se não estiver logado
    useEffect(() => {
        if (!idUsuario) {
            navigate('/');
            return;
        }
        carregarUsuario();
    }, []);

    // Limpa o erro após 8 segundos
    useEffect(() => {
        if (!erro) return;
        const t = setTimeout(() => setErro(''), 8000);
        return () => clearTimeout(t);
    }, [erro]);

    async function carregarUsuario() {
        try {
            const resposta = await fetch(`http://localhost:5000/buscar_usuarios/${idUsuario}`, {
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dados = await resposta.json();

            if (resposta.ok) {
                setUsuario(dados.usuario);
            } else {
                setErro("Não foi possível carregar os dados.");
            }
        } catch {
            setErro("Erro de conexão com o servidor.");
        }
    }

    async function fazerLogout() {
        try {
            await fetch('http://localhost:5000/logout', { method: 'POST', credentials: 'include' });
        } catch {}

        localStorage.removeItem('id_usuario');
        localStorage.removeItem('token');
        navigate('/');
    }

    return (
        <div className={css.pagina}>
            <main className={css.secao}>

                {erro && <p className={css.erro}>{erro}</p>}

                <div className={css.barra}>
                    <p className={css.saudacao}>
                        Olá, <span className={css.nome}>{usuario?.nome || ''}!</span>
                    </p>
                    <div className={css.botoes}>
                        <button className={css.btnAzul} onClick={() => navigate(`/editarTec/${idUsuario}`)}>
                            Editar Perfil
                        </button>
                        <button className={css.btnAzulClaro} onClick={fazerLogout}>
                            Logout
                        </button>
                    </div>
                </div>

                <ListaChamados />
                <CadastroChamado />

            </main>
        </div>
    );
}
