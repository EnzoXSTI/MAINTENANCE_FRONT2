import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import css from './ListaChamados.module.css';

const API_URL = 'http://localhost:5000';

export default function ListaChamados({ recarregar = 0 }) {
    const [chamados, setChamados] = useState([]);
    const [erro, setErro] = useState('');
    const [deletando, setDeletando] = useState(null);
    const navigate = useNavigate();

    const buscarChamados = useCallback(async () => {
        try {
            const resp = await fetch(`${API_URL}/listar_chamados`, { credentials: 'include' });
            const data = await resp.json();
            if (!resp.ok) { setErro(data.error || 'Erro ao carregar chamados.'); return; }
            setChamados(data.chamados);
            console.log(data.chamados)
        } catch {
            setErro('Erro de conexão com o servidor.');
        }
    }, []);

    const deletarChamado = useCallback(async (id_chamado) => {
        // Sem a mensagem de confirmação (vai direto)
        setDeletando(id_chamado);
        setErro('');
        try {
            const resp = await fetch(`${API_URL}/deletar_chamado/${id_chamado}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await resp.json();
            if (!resp.ok) { setErro(data.error || 'Erro ao deletar chamado.'); return; }
            setChamados(prev => prev.filter(c => c.id_chamado !== id_chamado));
        } catch {
            setErro('Erro de conexão com o servidor.');
        } finally {
            setDeletando(null);
        }
    }, []);

    useEffect(() => { buscarChamados(); }, [buscarChamados, recarregar]);

    return (
        <div className={css.container}>
            <h2 className={css.titulo}>Lista de Chamados</h2>
            {erro && <p className={css.erro}>{erro}</p>}

            <div className={css.tabelaWrapper}>
                <table className={css.tabela}>
                    <thead>
                    <tr>
                        <th>Sala</th>
                        <th>Data de Criação</th>
                        <th>Data de Finalização</th>
                        <th className={css.thAcoes}>Ações</th> {/* Classe nova aqui */}
                    </tr>
                    </thead>
                    <tbody>
                    {chamados.length === 0 ? (
                        <tr><td colSpan={4} className={css.vazio}>Nenhum chamado encontrado.</td></tr>
                    ) : (
                        chamados.map(c => (
                            <tr key={c.id_chamado}>
                                <td>{c.sala}</td>
                                <td>{c.data_abertura ?? '—'}</td>
                                <td>{c.data_finalizacao ?? ''}</td>
                                <td className={css.acoes}>
                                    <button
                                        className={css.btnAnalisar}
                                        onClick={() => navigate(`/analisar-chamado/${c.id_chamado}`)}
                                    >
                                        Analisar
                                    </button>
                                    {c.id_tecnico_atribuido && c.id_tecnico_atribuido.includes(Number(localStorage.getItem('id_usuario'))) && (
                                        <button
                                            className={css.btnDeletar}
                                            onClick={() => deletarChamado(c.id_chamado)}
                                            disabled={deletando === c.id_chamado}
                                        >
                                            Deletar {/* Texto fixo sem os "..." */}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}