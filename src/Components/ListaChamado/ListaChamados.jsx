import css from './ListaChamados.module.css';

const MOCK_CHAMADOS = [];

export default function ListaChamados({ chamados = MOCK_CHAMADOS }) {

    function formatarData(data) {
        if (!data) return 'Não finalizado';
        const d = new Date(data);
        return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return (
        <div className={css.container}>
            <h2 className={css.titulo}>Lista de Chamados</h2>

            <div className={css.tabelaWrapper}>
                <table className={css.tabela}>
                    <thead>
                        <tr>
                            <th>Salas</th>
                            <th>Data de Criação</th>
                            <th>Data de Finalização</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chamados.length === 0 ? (
                            <tr>
                                <td colSpan={4} className={css.vazio}>Nenhum chamado encontrado.</td>
                            </tr>
                        ) : (
                            chamados.map(c => (
                                <tr key={c.id}>
                                    <td>{c.sala}</td>
                                    <td>{formatarData(c.data_criacao)}</td>
                                    <td className={!c.data_finalizacao ? css.naoFinalizado : ''}>
                                        {formatarData(c.data_finalizacao)}
                                    </td>
                                    <td>
                                        <button className={css.btnAnalisar}>
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
