import { useState, useEffect } from "react";
import css from './AnalisarChamado.module.css';
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../Components/Input/Input.jsx";
import InputSelect from "../../Components/Select/InputSelect.jsx";
import Botao from "../../Components/Botao/Botao.jsx";

const API_URL = 'http://localhost:5000';
const SITUACOES = ['Aguardando', 'Em andamento', 'Urgente', 'Finalizado'];

async function apiFetch(path, options = {}) {
    const resp = await fetch(`${API_URL}${path}`, { credentials: 'include', ...options });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Erro na requisição.');
    return data;
}

export default function AnalisarChamado() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [chamado, setChamado] = useState(null);
    const [editando, setEditando] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const meuTipo = Number(localStorage.getItem('tipo_usuario'));
    const meuId   = Number(localStorage.getItem('id_usuario'));
    const [todosTecnicos, setTodosTecnicos] = useState([]);
    const [selecionados, setSelecionados] = useState([]);

    useEffect(() => {
        if (!erro && !mensagem) return;
        const t = setTimeout(() => { setErro(''); setMensagem(''); }, 8000);
        return () => clearTimeout(t);
    }, [erro, mensagem]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
    }, []);

    useEffect(() => {
        if (!id) return;
        async function carregar() {
            try {
                const { chamado } = await apiFetch(`/buscar_chamado/${id}`);
                setChamado(chamado);
                setSelecionados(chamado.tecnicos.map(t => t.id));
                if (meuTipo === 0) {
                    const { tecnicos } = await apiFetch('/listar_tecnicos');
                    setTodosTecnicos(tecnicos);
                }
            } catch (e) {
                setErro(e.message);
            }
        }
        carregar();
    }, [id]);

    function alterarCampo(campo, valor) {
        setChamado(prev => ({ ...prev, [campo]: valor }));
    }

    function toggleTecnico(idTec) {
        setSelecionados(prev =>
            prev.includes(idTec) ? prev.filter(x => x !== idTec) : [...prev, idTec]
        );
    }

    async function salvar() {
        try {
            const fd = new FormData();
            ['sala', 'patrimonio', 'titulo', 'descricao', 'situacao'].forEach(k =>
                fd.append(k, chamado[k] ?? '')
            );
            await apiFetch(`/atualizar_chamado/${id}`, { method: 'PUT', body: fd });
            setEditando(false);
            setMensagem('Chamado atualizado com sucesso!');
        } catch (e) { setErro(e.message); }
    }

    async function concluir() {
        try {
            await apiFetch(`/concluir_chamado/${id}`, { method: 'PUT' });
            setMensagem('Chamado concluído com sucesso!');
            setChamado(prev => ({ ...prev, situacao: 'Finalizado' }));
            setTimeout(() => navigate(-1), 2000);
        } catch (e) { setErro(e.message); }
    }

    async function atribuirTecnicos(ids) {
        try {
            const fd = new FormData();
            ids.forEach(i => fd.append('tecnicos', i));
            const data = await apiFetch(`/atribuir_tecnicos/${id}`, { method: 'PUT', body: fd });
            setChamado(prev => ({ ...prev, tecnicos: data.tecnicos }));
            setMensagem(ids.length ? 'Técnicos salvos com sucesso!' : 'Você foi atribuído ao chamado!');
        } catch (e) { setErro(e.message); }
    }

    const jaFinalizado = chamado?.situacao === 'Finalizado';
    const jaAtribuido = chamado?.tecnicos?.some(t => t.id === meuId);

    if (!chamado) return null;

    return (
        <div className={css.pagina}>
            <div className={css.topo}>
                <button className={css.btnVoltar} onClick={() => navigate(-1)}>Voltar</button>
                {meuTipo === 0 && !jaFinalizado && (
                    editando
                        ? <button className={css.btnSalvar} onClick={salvar}>Salvar</button>
                        : <button className={css.btnEditar} onClick={() => navigate(`/editar-chamado/${id}`)}>Editar</button>
                )}
            </div>

            <main className={css.conteudo}>
                {erro && <p className={css.erro}>{erro}</p>}
                {mensagem && <p className={css.sucesso}>{mensagem}</p>}

                <h1 className={css.titulo}>Analisar Chamado</h1>
                <div className={css.grid}>

                    <div className={css.coluna}>
                        {editando ? (
                            <>
                                <Input label="Sala" type="text" input={chamado.sala} alterarInput={e => alterarCampo('sala', e.target.value)} />
                                <Input label="Título" type="text" input={chamado.titulo} alterarInput={e => alterarCampo('titulo', e.target.value)} />
                                <Input label="Patrimônio" type="text" input={chamado.patrimonio ?? ''} alterarInput={e => alterarCampo('patrimonio', e.target.value)} />
                                <InputSelect label="Situação" valor={chamado.situacao} alterarValor={e => alterarCampo('situacao', e.target.value)} opcoes={SITUACOES} />
                            </>
                        ) : (
                            <>
                                {[
                                    ['Autor', chamado.autor],
                                    ['Sala', chamado.sala],
                                    ['Título', chamado.titulo],
                                    ['Patrimônio', chamado.patrimonio ?? '—'],
                                    ['Data de Abertura', chamado.data_abertura],
                                    ['Data de Finalização', chamado.data_finalizacao],
                                ].filter(([, v]) => v).map(([label, valor]) => (
                                    <div key={label} className={css.campo}>
                                        <label className={css.label}>{label}</label>
                                        <div className={css.valor}>{valor}</div>
                                    </div>
                                ))}
                                <div className={css.campo}>
                                    <label className={css.label}>Situação</label>
                                    <div>
                                        <span className={`${css.badge} ${css[`badge_${chamado.situacao?.replace(/\s/g, '_')}`]}`}>
                                            {chamado.situacao}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className={css.campo}>
                            <label className={css.label}>Técnicos Responsáveis</label>
                            {chamado.tecnicos?.length > 0
                                ? <div className={css.tecnicoLista}>{chamado.tecnicos.map(t => <div key={t.id} className={css.tecnicoItem}>{t.nome}</div>)}</div>
                                : <div className={css.valor}>Nenhum técnico atribuído</div>
                            }
                            {meuTipo === 0 && !jaFinalizado && (
                                <div className={css.atribuicao}>
                                    <p className={css.atribuicaoLabel}>Selecionar técnicos:</p>
                                    {todosTecnicos.map(t => (
                                        <label key={t.id} className={css.checkItem}>
                                            <input type="checkbox" checked={selecionados.includes(t.id)} onChange={() => toggleTecnico(t.id)} />
                                            {t.nome}
                                        </label>
                                    ))}
                                    <button className={css.btnAtribuir} onClick={() => atribuirTecnicos(selecionados)}>Salvar Técnicos</button>
                                </div>
                            )}
                            {meuTipo === 2 && !jaFinalizado && !jaAtribuido && chamado.tecnicos?.length === 0 &&  (
                                <button className={css.btnAtribuir} onClick={() => atribuirTecnicos([])}>Pegar este chamado</button>
                            )}
                            {meuTipo === 2 && jaAtribuido && (
                                <p className={css.atribuido}>Você está atribuído a este chamado</p>
                            )}
                        </div>
                    </div>

                    <div className={css.coluna}>
                        {editando ? (
                            <Input label="Descrição" type="text" input={chamado.descricao} alterarInput={e => alterarCampo('descricao', e.target.value)} gordo />
                        ) : (
                            <div className={css.campo}>
                                <label className={css.label}>Descrição</label>
                                <div className={`${css.valor} ${css.valorGrande}`}>{chamado.descricao}</div>
                            </div>
                        )}

                        <div className={css.campo}>
                            <label className={css.label}>Foto do acontecido</label>
                            <div className={css.fotoWrapper}>
                                <img
                                    src={chamado.foto ? `${API_URL}${chamado.foto}` : '/avatar.png'}
                                    alt="Foto do chamado"
                                    className={css.foto}
                                    onError={e => { e.target.src = '/avatar.png'; }}
                                />
                            </div>
                        </div>

                        {(meuTipo == 0 || meuTipo == 2) && selecionados.includes(meuId) && (
                            <Botao cor="Azul" texto="Concluir" acao={concluir} disabled={jaFinalizado} />
                        )}
                        {meuTipo == 0 && (
                            <Botao cor="Azul" texto="Concluir" acao={concluir} disabled={jaFinalizado} />
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
