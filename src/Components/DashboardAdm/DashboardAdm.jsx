import { useState, useEffect } from "react";
import css from './DashboardAdm.module.css';
import Footer from "../../Components/Footer/Footer.jsx";
import Header from "../../Components/Header/Header.jsx";
import { useNavigate } from "react-router-dom";

const BASE_URL = 'http://10.92.3.117:5000';

export default function DashboardAdm() {
    const [usuarios, setUsuarios] = useState([]);
    const [busca, setBusca] = useState('');
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const tipo = parseInt(localStorage.getItem('tipo_usuario'));
        if (tipo !== 0) { navigate('/'); return; }
        carregarUsuarios();
    }, []);

    useEffect(() => {
        if (!erro && !mensagem) return;
        const t = setTimeout(() => { setErro(''); setMensagem(''); }, 8000);
        return () => clearTimeout(t);
    }, [erro, mensagem]);

    async function carregarUsuarios() {
        try {
            const resposta = await fetch(`${BASE_URL}/listar_usuarios`, {
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dados = await resposta.json();
            if (resposta.ok) setUsuarios(dados.usuarios);
            else setErro(dados.error || "Erro ao carregar usuários.");
        } catch {
            setErro("Erro de conexão com o servidor.");
        }
    }

    async function desbloquear(id) {
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

    async function deletar(id, nome) {
        if (!confirm(`Tem certeza que deseja deletar ${nome}?`)) return;
        try {
            const resposta = await fetch(`${BASE_URL}/deletar_usuarios/${id}`, {
                method: 'DELETE',
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
        try {
            await fetch(`${BASE_URL}/logout`, { method: 'POST', credentials: 'include' });
        } catch {}
        localStorage.removeItem('id_usuario');
        localStorage.removeItem('token');
        localStorage.removeItem('tipo_usuario');
        navigate('/');
    }

    function statusUsuario(u) {
        if (!u.ativo)            return { label: 'Bloqueado', classe: css.bloqueado };
        if (!u.email_confirmado) return { label: 'Pendente',  classe: css.pendente };
        return                          { label: 'Ativo',     classe: css.ativo };
    }

    function tipoLabel(tipo) {
        if (tipo === 0) return 'ADM';
        if (tipo === 1) return 'Prestador';
        if (tipo === 2) return 'Empresa';
        return tipo;
    }

    const usuariosFiltrados = usuarios.filter(u =>
        u.nome.toLowerCase().includes(busca.toLowerCase()) ||
        u.email.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div className={css.pagina}>
            <Header />
            <main className={css.secao}>

                {erro && <p className={css.erro}>{erro}</p>}
                {mensagem && <p className={css.sucesso}>{mensagem}</p>}

                <div className={css.barra}>
                    <p className={css.titulo}>Gerenciar Usuários</p>
                    <div className={css.barraDireita}>
                        <input className={css.busca} type="text"
                            placeholder="Buscar por nome ou e-mail..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)} />
                        <button className={css.btnLogout} onClick={fazerLogout}>Logout</button>
                    </div>
                </div>

                <div className={css.tabelaWrapper}>
                    <table className={css.tabela}>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Tipo</th>
                                <th>Cadastro</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan={6} className={css.vazio}>Nenhum usuário encontrado.</td>
                                </tr>
                            )}
                            {usuariosFiltrados.map(u => {
                                const status = statusUsuario(u);
                                return (
                                    <tr key={u.id}>
                                        <td>{u.nome}</td>
                                        <td>{u.email}</td>
                                        <td>{tipoLabel(u.tipo)}</td>
                                        <td>{u.data_cadastro}</td>
                                        <td><span className={status.classe}>{status.label}</span></td>
                                        <td className={css.acoes}>
                                            {!u.ativo && (
                                                <button className={css.btnDesbloquear} onClick={() => desbloquear(u.id)}>
                                                    Desbloquear
                                                </button>
                                            )}
                                            <button className={css.btnDeletar} onClick={() => deletar(u.id, u.nome)}>
                                                Deletar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

            </main>
            <Footer />
        </div>
    );
}
