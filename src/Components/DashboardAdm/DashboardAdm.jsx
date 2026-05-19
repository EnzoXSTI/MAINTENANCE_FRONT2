import { useState, useEffect } from "react";
import css from './DashboardAdm.module.css';
import { useNavigate } from "react-router-dom";

const BASE_URL = 'http://10.92.3.147:5000'; // endereço do servidor

export default function DashboardAdm() {

    const [usuarios, setUsuarios] = useState([]);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    const navigate = useNavigate(); // serve pra trocar de página
    const token = localStorage.getItem('token'); // pega o token salvo no navegador

    // Roda uma vez quando a página abre
    useEffect(() => {

        // Pega o tipo do usuário salvo no navegador (0 = ADM)
        const tipo = parseInt(localStorage.getItem('tipo_usuario'));

        // Se não for ADM, manda pro login
        if (tipo !== 0) {
            navigate('/');
            return;
        }

        // Se for ADM, carrega a lista de usuários
        carregarUsuarios();

    }, []);

    // Toda vez que aparecer erro ou mensagem, some com eles depois de 8 segundos
    useEffect(() => {
        if (!erro && !mensagem) return;
        const t = setTimeout(() => { setErro(''); setMensagem(''); }, 8000);
        return () => clearTimeout(t);
    }, [erro, mensagem]);

    // Busca todos os usuários no servidor e salva na lista
    async function carregarUsuarios() {
        try {
            const resposta = await fetch(`${BASE_URL}/listar_usuarios`, {
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dados = await resposta.json();

            if (resposta.ok) {
                setUsuarios(dados.usuarios); // atualiza a lista na tela
            } else {
                setErro(dados.error || "Erro ao carregar usuários.");
            }
        } catch {
            setErro("Erro de conexão com o servidor.");
        }
    }

    // Desbloqueia um usuário pelo id
    async function desbloquear(id) {
        try {
            const resposta = await fetch(`${BASE_URL}/desbloquear_usuario/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dados = await resposta.json();

            if (resposta.ok) {
                setMensagem(dados.message);
                carregarUsuarios(); // recarrega a lista pra refletir a mudança
            } else {
                setErro(dados.error);
            }
        } catch {
            setErro("Erro de conexão com o servidor.");
        }
    }

    // Deleta um usuário pelo id (sem confirmação)
    async function deletar(id) {
        try {
            const resposta = await fetch(`${BASE_URL}/deletar_usuarios/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dados = await resposta.json();

            if (resposta.ok) {
                setMensagem(dados.message);
                carregarUsuarios(); // recarrega a lista pra refletir a mudança
            } else {
                setErro(dados.error);
            }
        } catch {
            setErro("Erro de conexão com o servidor.");
        }
    }

    // Desloga o ADM: avisa o servidor e limpa o navegador
    async function fazerLogout() {
        try {
            await fetch(`${BASE_URL}/logout`, { method: 'POST', credentials: 'include' });
        } catch {}

        localStorage.removeItem('id_usuario');  // apaga o id do navegador
        localStorage.removeItem('token');       // apaga o token do navegador
        localStorage.removeItem('tipo_usuario');// apaga o tipo do navegador
        navigate('/');                          // manda pro login
    }

    // Define o status do usuário baseado nos campos dele
    function statusUsuario(u) {
        if (!u.ativo)            return { label: 'Bloqueado', classe: css.bloqueado };
        if (!u.email_confirmado) return { label: 'Pendente',  classe: css.pendente  };
        return                          { label: 'Ativo',     classe: css.ativo     };
    }

    // Converte o número do tipo em texto legível
    function tipoLabel(tipo) {
        if (tipo === 0) return 'ADM';
        if (tipo === 1) return 'Prestador';
        if (tipo === 2) return 'Empresa';
        return tipo;
    }

    return (
        <div className={css.pagina}>
            <main className={css.secao}>

                {/* Mostra erro (vermelho) ou sucesso (verde) se tiver */}
                {erro     && <p className={css.erro}>{erro}</p>}
                {mensagem && <p className={css.sucesso}>{mensagem}</p>}

                {/* Barra do topo com título e botão de logout */}
                <div className={css.barra}>
                    <p className={css.titulo}>Gerenciar Usuários</p>
                    <button className={css.btnLogout} onClick={fazerLogout}>Logout</button>
                </div>

                {/* Tabela com todos os usuários */}
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

                            {/* Se não tiver nenhum usuário, mostra essa mensagem */}
                            {usuarios.length === 0 && (
                                <tr>
                                    <td colSpan={6} className={css.vazio}>Nenhum usuário encontrado.</td>
                                </tr>
                            )}

                            {/* Percorre a lista e cria uma linha por usuário */}
                            {usuarios.map(u => {
                                const status = statusUsuario(u);
                                return (
                                    <tr key={u.id}>
                                        <td>{u.nome}</td>
                                        <td>{u.email}</td>
                                        <td>{tipoLabel(u.tipo)}</td>
                                        <td>{u.data_cadastro}</td>
                                        <td>
                                            <span className={status.classe}>{status.label}</span>
                                        </td>
                                        <td className={css.acoes}>
                                            {/* Só aparece o botão Desbloquear se o usuário estiver bloqueado */}
                                            {!u.ativo && (
                                                <button className={css.btnDesbloquear} onClick={() => desbloquear(u.id)}>
                                                    Desbloquear
                                                </button>
                                            )}
                                            <button className={css.btnDeletar} onClick={() => deletar(u.id)}>
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
        </div>
    );
}
