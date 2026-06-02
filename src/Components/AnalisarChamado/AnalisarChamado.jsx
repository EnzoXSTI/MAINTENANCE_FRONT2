import { useState, useEffect } from "react";
import css from './AnalisarChamado.module.css';
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../Components/Input/Input.jsx";
import InputSelect from "../../Components/Select/InputSelect.jsx";
import Botao from "../../Components/Botao/Botao.jsx";

const API_URL = 'http://localhost:5000';
const SITUACOES = ['Aguardando', 'Em andamento', 'Urgente', 'Finalizado'];

export default function AnalisarChamado() {
    const { id } = useParams(); // Espera a rota: /analisar-chamado/:id
    const navigate = useNavigate();

    const [chamado, setChamado] = useState(null);
    const [editando, setEditando] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [concluindo, setConcluindo] = useState(false);

    // Limpa mensagens após 8s
    useEffect(() => {
        if (!erro && !mensagem) return;
        const t = setTimeout(() => { setErro(''); setMensagem(''); }, 8000);
        return () => clearTimeout(t);
    }, [erro, mensagem]);

    // Busca o chamado ao montar
    useEffect(() => {
        async function buscar() {
            try {
                const resp = await fetch(`${API_URL}/buscar_chamado/${id}`, {
                    credentials: 'include',
                });
                const data = await resp.json();

                if (!resp.ok) {
                    setErro(data.error || 'Erro ao buscar chamado.');
                    return;
                }

                setChamado(data.chamado);
            } catch {
                setErro('Erro de conexão com o servidor.');
            } finally {
                setCarregando(false);
            }
        }

        if (id) {
            buscar();
        } else {
            setErro('ID do chamado não informado.');
            setCarregando(false);
        }
    }, [id]);

    function alterarCampo(campo, valor) {
        setChamado(prev => ({ ...prev, [campo]: valor }));
    }

    async function salvar() {
        setErro('');
        setMensagem('');
        setSalvando(true);

        try {
            const formData = new FormData();
            formData.append('sala',       chamado.sala       ?? '');
            formData.append('patrimonio', chamado.patrimonio ?? '');
            formData.append('titulo',     chamado.titulo     ?? '');
            formData.append('descricao',  chamado.descricao  ?? '');
            formData.append('situacao',   chamado.situacao   ?? '');

            const resp = await fetch(`${API_URL}/atualizar_chamado/${id}`, {
                method: 'PUT',
                credentials: 'include',
                body: formData,
            });

            const data = await resp.json();

            if (!resp.ok) {
                setErro(data.error || 'Erro ao atualizar chamado.');
                return;
            }

            setEditando(false);
            setMensagem('Chamado atualizado com sucesso!');
        } catch {
            setErro('Erro de conexão com o servidor.');
        } finally {
            setSalvando(false);
        }
    }

    async function concluir() {
        setErro('');
        setMensagem('');
        setConcluindo(true);

        try {
            const resp = await fetch(`${API_URL}/concluir_chamado/${id}`, {
                method: 'PUT',
                credentials: 'include',
            });

            const data = await resp.json();

            if (!resp.ok) {
                setErro(data.error || 'Erro ao concluir chamado.');
                return;
            }

            setMensagem('Chamado concluído com sucesso!');
            setTimeout(() => navigate(-1), 2000);
        } catch {
            setErro('Erro de conexão com o servidor.');
        } finally {
            setConcluindo(false);
        }
    }

    if (carregando) {
        return (
            <div className={css.pagina}>
                <p style={{ textAlign: 'center', marginTop: '4rem', color: '#5aabdd' }}>Carregando chamado...</p>
            </div>
        );
    }

    return (
        <div className={css.pagina}>

            <div className={css.topo}>
                <button className={css.btnVoltar} onClick={() => navigate(-1)}>Voltar</button>
                {chamado && (
                    !editando
                        ? <button className={css.btnEditar} onClick={() => setEditando(true)}>Editar</button>
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
                                        <Input label="Autor" type="text" input={chamado.autor}
                                            alterarInput={e => alterarCampo('autor', e.target.value)} />
                                        <Input label="Sala" type="text" input={chamado.sala}
                                            alterarInput={e => alterarCampo('sala', e.target.value)} />
                                        <Input label="Titulo" type="text" input={chamado.titulo}
                                            alterarInput={e => alterarCampo('titulo', e.target.value)} />
                                        <Input label="Patrimonio" type="text" input={chamado.patrimonio ?? ''}
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
                                            <label className={css.label}>Titulo</label>
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
                                    </>
                                )}
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

                                <Botao
                                    cor="Azul"
                                    texto={concluindo ? 'Concluindo...' : 'Concluir'}
                                    acao={concluir}
                                    disabled={concluindo || chamado.situacao === 'Finalizado'}
                                />
                            </div>

                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
