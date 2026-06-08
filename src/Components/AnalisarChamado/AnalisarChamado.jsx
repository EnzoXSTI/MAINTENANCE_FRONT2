import { useState, useEffect } from "react";
import css from './AnalisarChamado.module.css';
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../Components/Input/Input.jsx";
import InputSelect from "../../Components/Select/InputSelect.jsx";
import Botao from "../../Components/Botao/Botao.jsx";

const API_URL = 'http://localhost:5000';
const SITUACOES = ['Aguardando', 'Em andamento', 'Urgente', 'Finalizado'];

export default function AnalisarChamado() {
    const { id }   = useParams();
    const navigate = useNavigate();

    const [chamado,    setChamado]    = useState(null);
    const [editando,   setEditando]   = useState(false);
    const [mensagem,   setMensagem]   = useState('');
    const [erro,       setErro]       = useState('');
    const [carregando, setCarregando] = useState(true);
    const [salvando,   setSalvando]   = useState(false);
    const [concluindo, setConcluindo] = useState(false);
    const [atribuindo, setAtribuindo] = useState(false);

    const [meuTipo,       setMeuTipo]       = useState(null);
    const [meuId,         setMeuId]         = useState(null);
    const [todosTecnicos, setTodosTecnicos] = useState([]);
    const [selecionados,  setSelecionados]  = useState([]);  // IDs escolhidos pelo ADM

    useEffect(() => {
        if (!erro && !mensagem) return;
        const t = setTimeout(() => { setErro(''); setMensagem(''); }, 8000);
        return () => clearTimeout(t);
    }, [erro, mensagem]);

    useEffect(() => {
        async function carregar() {
            try {
                const [respChamado, respMe] = await Promise.all([
                    fetch(`${API_URL}/buscar_chamado/${id}`, { credentials: 'include' }),
                    fetch(`${API_URL}/me`,                   { credentials: 'include' }),
                ]);

                const dataChamado = await respChamado.json();
                if (!respChamado.ok) { setErro(dataChamado.error || 'Erro ao buscar chamado.'); return; }
                setChamado(dataChamado.chamado);

                if (respMe.ok) {
                    const me = await respMe.json();
                    setMeuTipo(me.tipo);
                    setMeuId(me.id_usuario);

                    if (me.tipo === 0) {
                        const respTec = await fetch(`${API_URL}/listar_tecnicos`, { credentials: 'include' });
                        if (respTec.ok) {
                            const dt = await respTec.json();
                            setTodosTecnicos(dt.tecnicos);
                        }
                        setSelecionados(dataChamado.chamado.tecnicos.map(t => t.id));
                    }
                }
            } catch {
                setErro('Erro de conexão com o servidor.');
            } finally {
                setCarregando(false);
            }
        }
        if (id) carregar();
        else { setErro('ID não informado.'); setCarregando(false); }
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
        setErro(''); setMensagem(''); setSalvando(true);
        try {
            const fd = new FormData();
            fd.append('sala',       chamado.sala       ?? '');
            fd.append('patrimonio', chamado.patrimonio ?? '');
            fd.append('titulo',     chamado.titulo     ?? '');
            fd.append('descricao',  chamado.descricao  ?? '');
            fd.append('situacao',   chamado.situacao   ?? '');

            const resp = await fetch(`${API_URL}/atualizar_chamado/${id}`, {
                method: 'PUT', credentials: 'include', body: fd,
            });
            const data = await resp.json();
            if (!resp.ok) { setErro(data.error || 'Erro ao atualizar.'); return; }
            setEditando(false);
            setMensagem('Chamado atualizado com sucesso!');
        } catch { setErro('Erro de conexão.'); }
        finally { setSalvando(false); }
    }

    async function concluir() {
        setErro(''); setMensagem(''); setConcluindo(true);
        try {
            const resp = await fetch(`${API_URL}/concluir_chamado/${id}`, {
                method: 'PUT', credentials: 'include',
            });
            const data = await resp.json();
            if (!resp.ok) { setErro(data.error || 'Erro ao concluir.'); return; }
            setMensagem('Chamado concluído com sucesso!');
            setChamado(prev => ({ ...prev, situacao: 'Finalizado' }));
            setTimeout(() => navigate(-1), 2000);
        } catch { setErro('Erro de conexão.'); }
        finally { setConcluindo(false); }
    }

    async function salvarAtribuicaoAdm() {
        setErro(''); setMensagem(''); setAtribuindo(true);
        try {
            const fd = new FormData();
            selecionados.forEach(id => fd.append('tecnicos', id));

            const resp = await fetch(`${API_URL}/atribuir_tecnicos/${id}`, {
                method: 'PUT', credentials: 'include', body: fd,
            });
            const data = await resp.json();
            if (!resp.ok) { setErro(data.error || 'Erro ao atribuir.'); return; }
            setChamado(prev => ({ ...prev, tecnicos: data.tecnicos }));
            setMensagem('Técnicos salvos com sucesso!');
        } catch { setErro('Erro de conexão.'); }
        finally { setAtribuindo(false); }
    }

    async function pegarChamado() {
        setErro(''); setMensagem(''); setAtribuindo(true);
        try {
            const resp = await fetch(`${API_URL}/atribuir_tecnicos/${id}`, {
                method: 'PUT', credentials: 'include', body: new FormData(),
            });
            const data = await resp.json();
            if (!resp.ok) { setErro(data.error || 'Erro ao pegar chamado.'); return; }
            setChamado(prev => ({ ...prev, tecnicos: data.tecnicos }));
            setMensagem('Você foi atribuído ao chamado!');
        } catch { setErro('Erro de conexão.'); }
        finally { setAtribuindo(false); }
    }

    const jaFinalizado = chamado?.situacao === 'Finalizado';
    const jaAtribuido  = chamado?.tecnicos?.some(t => t.id === meuId);

    if (carregando) return (
        <div className={css.pagina}>
            <p className={css.carregando}>Carregando chamado...</p>
        </div>
    );

    return (
        <div className={css.pagina}>

            <div className={css.topo}>
                <button className={css.btnVoltar} onClick={() => navigate(-1)}>Voltar</button>
                {chamado && (
                    !editando
                        ? <button className={css.btnEditar} onClick={() => navigate(`/editar-chamado/${id}`)}>Editar</button>
                        : <button className={css.btnSalvar} onClick={salvar} disabled={salvando}>
                            {salvando ? 'Salvando...' : 'Salvar'}
                          </button>
                )}
            </div>

            <main className={css.conteudo}>
                {erro     && <p className={css.erro}>{erro}</p>}
                {mensagem && <p className={css.sucesso}>{mensagem}</p>}

                {chamado && (
                    <>
                        <h1 className={css.titulo}>Analisar Chamado</h1>

                        <div className={css.grid}>

                            {/* Coluna esquerda */}
                            <div className={css.coluna}>
                                {editando ? (
                                    <>
                                        <Input label="Sala" type="text" input={chamado.sala}
                                            alterarInput={e => alterarCampo('sala', e.target.value)} />
                                        <Input label="Título" type="text" input={chamado.titulo}
                                            alterarInput={e => alterarCampo('titulo', e.target.value)} />
                                        <Input label="Patrimônio" type="text" input={chamado.patrimonio ?? ''}
                                            alterarInput={e => alterarCampo('patrimonio', e.target.value)} />
                                        <InputSelect label="Situação" valor={chamado.situacao}
                                            alterarValor={e => alterarCampo('situacao', e.target.value)}
                                            opcoes={SITUACOES} />
                                    </>
                                ) : (
                                    <>
                                        <div className={css.campo}>
                                            <label className={css.label}>Autor</label>
                                            <div className={css.valor}>{chamado.autor}</div>
                                        </div>
                                        <div className={css.campo}>
                                            <label className={css.label}>Sala</label>
                                            <div className={css.valor}>{chamado.sala}</div>
                                        </div>
                                        <div className={css.campo}>
                                            <label className={css.label}>Título</label>
                                            <div className={css.valor}>{chamado.titulo}</div>
                                        </div>
                                        <div className={css.campo}>
                                            <label className={css.label}>Patrimônio</label>
                                            <div className={css.valor}>{chamado.patrimonio ?? '—'}</div>
                                        </div>
                                        <div className={css.campo}>
                                            <label className={css.label}>Situação</label>
                                            <div className={css.valor}>{chamado.situacao}</div>
                                        </div>
                                        {chamado.data_abertura && (
                                            <div className={css.campo}>
                                                <label className={css.label}>Data de Abertura</label>
                                                <div className={css.valor}>{chamado.data_abertura}</div>
                                            </div>
                                        )}
                                        {chamado.data_finalizacao && (
                                            <div className={css.campo}>
                                                <label className={css.label}>Data de Finalização</label>
                                                <div className={css.valor}>{chamado.data_finalizacao}</div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Técnicos */}
                                <div className={css.campo}>
                                    <label className={css.label}>Técnicos Responsáveis</label>

                                    {chamado.tecnicos?.length > 0 ? (
                                        <div className={css.tecnicoLista}>
                                            {chamado.tecnicos.map(t => (
                                                <div key={t.id} className={css.tecnicoItem}>{t.nome}</div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={css.valor}>Nenhum técnico atribuído</div>
                                    )}

                                    {/* ADM: checkboxes */}
                                    {meuTipo === 0 && !jaFinalizado && (
                                        <div className={css.atribuicao}>
                                            <p className={css.atribuicaoLabel}>Selecionar técnicos:</p>
                                            {todosTecnicos.map(t => (
                                                <label key={t.id} className={css.checkItem}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selecionados.includes(t.id)}
                                                        onChange={() => toggleTecnico(t.id)}
                                                    />
                                                    {t.nome}
                                                </label>
                                            ))}
                                            <button className={css.btnAtribuir} onClick={salvarAtribuicaoAdm} disabled={atribuindo}>
                                                {atribuindo ? 'Salvando...' : 'Salvar Técnicos'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Técnico: botão pegar chamado */}
                                    {meuTipo === 2 && !jaFinalizado && !jaAtribuido && (
                                        <button className={css.btnAtribuir} onClick={pegarChamado} disabled={atribuindo}>
                                            {atribuindo ? 'Aguarde...' : 'Pegar este chamado'}
                                        </button>
                                    )}
                                    {meuTipo === 2 && jaAtribuido && (
                                        <p className={css.atribuido}>Voce esta atribuido a este chamado</p>
                                    )}
                                </div>
                            </div>

                            {/* Coluna direita */}
                            <div className={css.coluna}>
                                {editando ? (
                                    <Input label="Descrição" type="text" input={chamado.descricao}
                                        alterarInput={e => alterarCampo('descricao', e.target.value)}
                                        gordo />
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

                                {(meuTipo === 0 || meuTipo === 2) && (
                                    <Botao
                                        cor="Azul"
                                        texto={concluindo ? 'Concluindo...' : 'Concluir'}
                                        acao={concluir}
                                        disabled={concluindo || jaFinalizado}
                                    />
                                )}
                            </div>

                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
