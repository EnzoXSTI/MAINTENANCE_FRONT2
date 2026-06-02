import { useState, useEffect, useRef } from "react";
import css from './DashboardAdm.module.css';
import { useNavigate } from "react-router-dom";
import ListaChamados from "../ListaChamado/ListaChamados.jsx";
import CadastroChamado from "../CadastroChamado/CadastroChamado.jsx";

const BASE_URL = 'http://localhost:5000';

const SECOES = [
    {
        titulo: 'Professores Cadastrados',
        btnLabel: 'Cadastrar Professor',
        btnRota: '/cadastrarPro',
        tipo: 1,
        rotaEditar: '/editarPro',
        labelEditar: 'Editar Professor',
    },
    {
        titulo: 'Técnicos Cadastrados',
        btnLabel: 'Cadastrar Técnico',
        btnRota: '/cadastrarTec',
        tipo: 2,
        rotaEditar: '/EditarTec',
        labelEditar: 'Editar Técnico',
    },
    {
        titulo: 'ADMs Cadastrados',
        btnLabel: 'Cadastrar ADM',
        btnRota: '/cadastrarAdm',
        tipo: 0,
        rotaEditar: '/EditarAdm',
        labelEditar: 'Editar ADM',
    },
];

export default function DashboardAdm() {
    const [usuarios, setUsuarios] = useState([]);
    const [adm, setAdm] = useState(null);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    // Incrementado toda vez que um chamado é cadastrado, forçando o ListaChamados a recarregar
    const [recarregarChamados, setRecarregarChamados] = useState(0);

    const refs = [useRef(null), useRef(null), useRef(null)];

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const idUsuario = localStorage.getItem('id_usuario');

    useEffect(() => {
        const tipo = parseInt(localStorage.getItem('tipo_usuario'));
        if (tipo !== 0) { navigate('/'); return; }
        carregarAdm();
        carregarUsuarios();
    }, []);

    useEffect(() => {
        if (!erro && !mensagem) return;
        const t = setTimeout(() => { setErro(''); setMensagem(''); }, 8000);
        return () => clearTimeout(t);
    }, [erro, mensagem]);

    async function carregarAdm() {
        try {
            const r = await fetch(`${BASE_URL}/buscar_usuarios/${idUsuario}`, {
                credentials: 'include',
                headers: { Authorization: `Bearer ${token}` },
            });
            const d = await r.json();
            if (r.ok) setAdm(d.usuario);
        } catch {}
    }

    async function carregarUsuarios() {
        try {
            const r = await fetch(`${BASE_URL}/listar_usuarios`, {
                credentials: 'include',
                headers: { Authorization: `Bearer ${token}` },
            });
            const d = await r.json();
            if (r.ok) setUsuarios(d.usuarios);
            else setErro(d.error || 'Erro ao carregar usuários.');
        } catch {
            setErro('Erro de conexão com o servidor.');
        }
    }

    async function toggleAtivo(id, ativo) {
        const rota = ativo
            ? `${BASE_URL}/bloquear_usuario/${id}`
            : `${BASE_URL}/desbloquear_usuario/${id}`;
        try {
            const r = await fetch(rota, {
                method: 'PUT',
                credentials: 'include',
                headers: { Authorization: `Bearer ${token}` },
            });
            const d = await r.json();
            if (r.ok) { setMensagem(d.message); carregarUsuarios(); }
            else setErro(d.error);
        } catch {
            setErro('Erro de conexão com o servidor.');
        }
    }

    async function fazerLogout() {
        try { await fetch(`${BASE_URL}/logout`, { method: 'POST', credentials: 'include' }); } catch {}
        localStorage.removeItem('id_usuario');
        localStorage.removeItem('token');
        localStorage.removeItem('tipo_usuario');
        navigate('/');
    }

    function scroll(ref, dir) {
        ref.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
    }

    return (
        <div className={css.pagina}>

            <main className={css.secao}>
                {erro     && <p className={css.erro}>{erro}</p>}
                {mensagem && <p className={css.sucesso}>{mensagem}</p>}

                <div className={css.barra}>
                    <h1 className={css.saudacao}>
                        olá, <span className={css.nome}>{adm?.nome || 'ADM'}!</span>
                    </h1>
                    <div className={css.botoesBarra}>
                        <button className={css.btnAzul} onClick={() => navigate(`/EditarAdm/${idUsuario}`)}>
                            Editar Perfil
                        </button>
                        <button className={css.btnAzulClaro} onClick={fazerLogout}>
                            logout
                        </button>
                    </div>
                </div>

                {/* Lista recarrega automaticamente quando recarregarChamados muda */}
                <ListaChamados recarregar={recarregarChamados} />

                {/* Ao concluir cadastro, incrementa o contador para forçar recarga da lista */}
                <CadastroChamado onCadastroConcluido={() => setRecarregarChamados(n => n + 1)} />

                {SECOES.map((s, i) => {
                    const lista = usuarios.filter(u => u.tipo === s.tipo);
                    return (
                        <div key={s.tipo} className={css.secaoCadastros}>
                            <div className={css.cabecalho}>
                                <h2 className={css.tituloSecao}>{s.titulo}</h2>
                                <button className={css.btnCadastrar} onClick={() => navigate(s.btnRota)}>
                                    {s.btnLabel}
                                </button>
                            </div>

                            <div className={css.carrosselWrapper}>
                                <button className={css.btnSeta} onClick={() => scroll(refs[i], -1)}>&#8249;</button>

                                <div className={css.carrossel} ref={refs[i]}>
                                    {lista.length === 0
                                        ? <p className={css.vazio}>Nenhum cadastro encontrado.</p>
                                        : lista.map(u => (
                                            <div key={u.id} className={css.card}>
                                                <div className={css.cardAvatar}>
                                                    <img
                                                        src={`${BASE_URL}/uploads/Usuarios/${u.id}.jpeg`}
                                                        alt={u.nome}
                                                        className={css.avatarImg}
                                                        onError={e => { e.target.src = '/avatar.png'; }}
                                                    />
                                                </div>
                                                <p className={css.cardNome}>{u.nome}</p>
                                                <button
                                                    className={css.btnEditar}
                                                    onClick={() => navigate(`${s.rotaEditar}/${u.id}`)}
                                                >
                                                    {s.labelEditar}
                                                </button>
                                                <button
                                                    className={u.ativo ? css.btnInativar : css.btnDesbloquear}
                                                    onClick={() => toggleAtivo(u.id, u.ativo)}
                                                >
                                                    {u.ativo ? 'Bloquear' : 'Desbloquear'}
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div>

                                <button className={css.btnSeta} onClick={() => scroll(refs[i], 1)}>&#8250;</button>
                            </div>
                        </div>
                    );
                })}
            </main>
        </div>
    );
}
