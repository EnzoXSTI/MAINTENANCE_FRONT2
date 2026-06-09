import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import css from './ListaChamados.module.css';

const API_URL = 'http://localhost:5000';

export default function ListaChamados({ recarregar = 0 }) {
    const [chamados, setChamados] = useState([]);
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    const buscarChamados = useCallback(async () => {
        try {
            const resp = await fetch(`${API_URL}/listar_chamados`, { credentials: 'include' });
            const data = await resp.json();
            if (!resp.ok) { setErro(data.error || 'Erro ao carregar chamados.'); return; }
            setChamados(data.chamados);
        } catch {
            setErro('Erro de conexão com o servidor.');
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
                            {['Sala', 'Data de Criação', 'Data de Finalização', 'Ações'].map(h => (
                                <th key={h}>{h}</th>
                            ))}
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
                                    <td>
                                        <button className={css.btnAnalisar} onClick={() => navigate(`/analisar-chamado/${c.id_chamado}`)}>
                                            Analisar
                                        </button>
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
