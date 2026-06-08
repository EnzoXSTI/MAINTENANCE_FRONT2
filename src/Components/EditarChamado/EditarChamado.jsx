import { useState, useEffect } from "react";
import css from './EditarChamado.module.css';
import Input from "../../Components/Input/Input.jsx";
import InputSelect from "../../Components/Select/InputSelect.jsx";
import Botao from "../../Components/Botao/Botao.jsx";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = 'http://localhost:5000';
const SITUACOES = ['Aguardando', 'Em andamento', 'Urgente'];

export default function EditarChamado() {
    const { id }   = useParams();
    const navigate = useNavigate();

    const [sala,       setSala]       = useState('');
    const [patrimonio, setPatrimonio] = useState('');
    const [titulo,     setTitulo]     = useState('');
    const [descricao,  setDescricao]  = useState('');
    const [situacao,   setSituacao]   = useState('');
    const [erro,       setErro]       = useState('');
    const [mensagem,   setMensagem]   = useState('');
    const [salvando,   setSalvando]   = useState(false);

    useEffect(() => {
        if (!erro && !mensagem) return;
        const t = setTimeout(() => { setErro(''); setMensagem(''); }, 8000);
        return () => clearTimeout(t);
    }, [erro, mensagem]);

    useEffect(() => {
        async function carregar() {
            try {
                const resp = await fetch(`${API_URL}/buscar_chamado/${id}`, {
                    credentials: 'include',
                });
                const data = await resp.json();
                if (!resp.ok) { setErro(data.error || 'Erro ao carregar chamado.'); return; }

                const c = data.chamado;
                setSala(c.sala ?? '');
                setPatrimonio(c.patrimonio ?? '');
                setTitulo(c.titulo ?? '');
                setDescricao(c.descricao ?? '');
                setSituacao(c.situacao ?? '');
            } catch {
                setErro('Erro de conexão com o servidor.');
            }
        }
        if (id) carregar();
    }, [id]);

    async function salvar() {
        setErro(''); setMensagem(''); setSalvando(true);
        try {
            const fd = new FormData();
            fd.append('sala',       sala.trim());
            fd.append('patrimonio', patrimonio.trim());
            fd.append('titulo',     titulo.trim());
            fd.append('descricao',  descricao.trim());
            fd.append('situacao',   situacao);

            const resp = await fetch(`${API_URL}/atualizar_chamado/${id}`, {
                method: 'PUT', credentials: 'include', body: fd,
            });
            const data = await resp.json();
            if (!resp.ok) { setErro(data.error || 'Erro ao salvar.'); return; }

            setMensagem('Chamado atualizado com sucesso!');
            setTimeout(() => navigate(-1), 2000);
        } catch {
            setErro('Erro de conexão com o servidor.');
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className={css.pagina}>
            <main className={css.secao}>
                <div className={css.conteudo}>

                    {erro     && <p className={css.erro}>{erro}</p>}
                    {mensagem && <p className={css.sucesso}>{mensagem}</p>}

                    <div className={css.logo}>
                        <img src="/logo2.png" alt="Logo" className={css.logoImg} />
                    </div>

                    <p className={css.subtitulo}>Editar Chamado</p>

                    <div className={css.campos}>
                        <Input label="Sala" type="text" input={sala}
                            alterarInput={e => setSala(e.target.value)}
                            placeholder="Ex: 101" />

                        <Input label="Patrimônio" type="text" input={patrimonio}
                            alterarInput={e => setPatrimonio(e.target.value)}
                            placeholder="Ex: 1" />

                        <Input label="Título" type="text" input={titulo}
                            alterarInput={e => setTitulo(e.target.value)}
                            placeholder="Ex: infiltração" />

                        <Input label="Descrição" type="text" input={descricao}
                            alterarInput={e => setDescricao(e.target.value)}
                            placeholder="Descreva o ocorrido"
                            gordo />

                        <InputSelect
                            label="Situação"
                            valor={situacao}
                            alterarValor={e => setSituacao(e.target.value)}
                            opcoes={SITUACOES}
                        />
                    </div>

                    <div className={css.botoes}>
                        <Botao cor="Azul" texto={salvando ? 'Salvando...' : 'Salvar alterações'} acao={salvar} disabled={salvando} />
                        <Botao cor="Branco" texto="Voltar" acao={() => navigate(-1)} />
                    </div>

                </div>
            </main>
        </div>
    );
}
