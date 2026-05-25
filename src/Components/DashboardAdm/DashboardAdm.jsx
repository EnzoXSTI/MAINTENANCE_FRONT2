import { useState, useEffect, useRef } from "react";
import css from './DashboardAdm.module.css';
import { useNavigate } from "react-router-dom";

const BASE_URL = 'http://10.92.3.149:5000';

export default function DashboardAdm() {
    const [usuarios, setUsuarios] = useState([]);
    const [adm, setAdm] = useState(null);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    const carrosselRef = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const idUsuario = localStorage.getItem('id_usuario');

    useEffect(() => {
        const tipo = parseInt(localStorage.getItem('tipo_usuario'));
        if (tipo !== 0) { navigate('/'); return; }
        carregarUsuarios();
        carregarAdm();
    }, []);

    useEffect(() => {
        if (!erro && !mensagem) return;
        const t = setTimeout(() => { setErro(''); setMensagem(''); }, 8000);
        return () => clearTimeout(t);
    }, [erro, mensagem]);

    async function carregarAdm() {
        try {
            const resposta = await fetch(`${BASE_URL}/buscar_usuarios/${idUsuario}`, {
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dados = await resposta.json();
            if (resposta.ok) setAdm(dados.usuario);
        } catch {}
    }

    async function carregarUsuarios() {
        try {
            const resposta = await fetch(`${BASE_URL}/listar_usuarios`, {
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dados = await resposta.json();
            if (resposta.ok) {
                // Filtra só professores (tipo != 0)
                setUsuarios(dados.usuarios.filter(u => u.tipo !== 0));
            } else {
                setErro(dados.error || "Erro ao carregar usuários.");
            }
        } catch {
            setErro("Erro de conexão com o servidor.");
        }
    }

    async function inativar(id) {
        try {
            const resposta = await fetch(`${BASE_URL}/desbloquear_usuario/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dados = await resposta.json();
            if (resposta.ok) { setMensagem(dados.message); carregarUsuarios(); }
            else setErro(dados.error);
        } catch {
            setErro("Erro de conexão com o servidor.");
        }
    }

    async function fazerLogout() {
        try { await fetch(`${BASE_URL}/logout`, { method: 'POST', credentials: 'include' }); } catch {}
        localStorage.removeItem('id_usuario');
        localStorage.removeItem('token');
        localStorage.removeItem('tipo_usuario');
        navigate('/');
    }

    function scrollCarrossel(direcao) {
        if (carrosselRef.current) {
            carrosselRef.current.scrollBy({ left: direcao * 320, behavior: 'smooth' });
        }
    }

    return (
        <div className={css.pagina}>

            {/* Header */}
            <header className={css.header}>
                <div className={css.headerLogo}>
                    <img src="/logo2.png" alt="Logo" className={css.logoImg} />
                </div>
                <div className={css.headerPerfil}>
                    <img
                        src={adm?.foto_perfil ? `${BASE_URL}/${adm.foto_perfil}` : '/avatar.png'}
                        alt="Perfil"
                        className={css.avatarHeader}
                    />
                </div>
            </header>

            <main className={css.secao}>

                {erro     && <p className={css.erro}>{erro}</p>}
                {mensagem && <p className={css.sucesso}>{mensagem}</p>}

                {/* Saudação */}
                <div className={css.barra}>
                    <h1 className={css.saudacao}>
                        olá, <span className={css.nome}>{adm?.nome || 'ADM'}!</span>
                    </h1>
                    <div className={css.botoesBarra}>
                        <button className={css.btnAzul} onClick={() => navigate('/editarAdm')}>
                            Editar Perfil
                        </button>
                        <button className={css.btnAzulClaro} onClick={fazerLogout}>
                            logout
                        </button>
                    </div>
                </div>

                {/* Seção de professores */}
                <div className={css.secaoProfessores}>
                    <div className={css.cabecalhoProfessores}>
                        <h2 className={css.tituloProfessores}>Professores Cadastrados</h2>
                        <div className={css.botoesHeader}>
                            <button className={css.btnCadastrar} onClick={() => navigate('/cadastro')}>
                                Cadastrar Professor
                            </button>
                            <button className={css.btnCadastrarAdm} onClick={() => navigate('/cadastrarAdm')}>
                                Cadastrar ADM
                            </button>
                        </div>
                    </div>

                    <div className={css.carrosselWrapper}>
                        <button className={css.btnSeta} onClick={() => scrollCarrossel(-1)}>&#8249;</button>

                        <div className={css.carrossel} ref={carrosselRef}>
                            {usuarios.length === 0 && (
                                <p className={css.vazio}>Nenhum professor cadastrado.</p>
                            )}
                            {usuarios.map(u => (
                                <div key={u.id} className={css.card}>
                                    <div className={css.cardAvatar}>
                                        <img
                                            src={u.foto_perfil ? `${BASE_URL}/${u.foto_perfil}` : '/avatar.png'}
                                            alt={u.nome}
                                            className={css.avatarImg}
                                        />
                                    </div>
                                    <p className={css.cardNome}>{u.nome}</p>
                                    <button
                                        className={css.btnInativar}
                                        onClick={() => inativar(u.id)}
                                    >
                                        Inativar Professor
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button className={css.btnSeta} onClick={() => scrollCarrossel(1)}>&#8250;</button>
                    </div>
                </div>

            </main>
        </div>
    );
}
