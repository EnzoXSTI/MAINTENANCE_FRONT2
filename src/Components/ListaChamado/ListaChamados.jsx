import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import css from './ListaChamados.module.css';

const API_URL = 'http://localhost:5000';

export default function ListaChamados({ recarregar = 0 }) {
    const [chamados, setChamados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    const buscarChamados = useCallback(async () => {
        setCarregando(true);
        setErro('');
        try {
            const resp = await fetch(`${API_URL}/listar_chamados`, {
                credentials: 'include',
            });
            const data = await resp.json();

            if (!resp.ok) {
                setErro(data.error || 'Erro ao carregar chamados.');
                return;
            }

            setChamados(data.chamados);
        } catch {
            setErro('Erro de conexão com o servidor.');
        } finally {
            setCarregando(false);
        }
    }, []);

    // Recarrega sempre que o prop `recarregar` mudar (ex: após cadastro)
    useEffect(() => {
        buscarChamados();
    }, [buscarChamados, recarregar]);

    return (
        <div className={css.container}>
            <h2 className={css.titulo}>Lista de Chamados</h2>

            {erro && <p className={css.erro}>{erro}</p>}

            <div className={css.tabelaWrapper}>
                {carregando ? (
                    <p style={{ color: '#5aabdd', textAlign: 'center', padding: '2rem' }}>
                        Carregando chamados...
                    </p>
                ) : (
                    <table className={css.tabela}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Autor</th>
                                <th>Sala</th>
                                <th>Título</th>
                                <th>Situação</th>
                                <th>Data de Abertura</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chamados.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className={css.vazio}>
                                        Nenhum chamado encontrado.
                                    </td>
                                </tr>
                            ) : (
                                chamados.map(c => (
                                    <tr key={c.id_chamado}>
                                        <td>{c.id_chamado}</td>
                                        <td>{c.autor}</td>
                                        <td>{c.sala}</td>
                                        <td>{c.titulo}</td>
                                        <td>
                                            <span className={`${css.badge} ${css[`badge_${c.situacao?.replace(/\s/g, '_')}`]}`}>
                                                {c.situacao}
                                            </span>
                                        </td>
                                        <td>{c.data_abertura ?? '—'}</td>
                                        <td>
                                            <button
                                                className={css.btnAnalisar}
                                                onClick={() => navigate(`/analisar-chamado/${c.id_chamado}`)}
                                            >
                                                Analisar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
