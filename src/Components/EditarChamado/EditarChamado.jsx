import { useState, useEffect } from "react";
import css from './EditarChamado.module.css';
import Input from "../../Components/Input/Input.jsx";
import InputSelect from "../../Components/Select/InputSelect.jsx";
import Botao from "../../Components/Botao/Botao.jsx";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = 'http://localhost:5000';
const SITUACOES = ['Aguardando', 'Em andamento', 'Urgente'];
const CAMPOS_INICIAIS = { sala: '', patrimonio: '', titulo: '', descricao: '', situacao: '' };

export default function EditarChamado() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [campos, setCampos] = useState(CAMPOS_INICIAIS);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    useEffect(() => {
        if (!erro && !mensagem) return;
        const t = setTimeout(() => { setErro(''); setMensagem(''); }, 8000);
        return () => clearTimeout(t);
    }, [erro, mensagem]);

    useEffect(() => {
        if (!id) return;
        fetch(`${API_URL}/buscar_chamado/${id}`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                if (data.error) { setErro(data.error); return; }
                const { sala, patrimonio, titulo, descricao, situacao } = data.chamado;
                setCampos({ sala: sala ?? '', patrimonio: patrimonio ?? '', titulo: titulo ?? '', descricao: descricao ?? '', situacao: situacao ?? '' });
            })
            .catch(() => setErro('Erro de conexão com o servidor.'));
    }, [id]);

    function alterar(campo) {
        return e => setCampos(prev => ({ ...prev, [campo]: e.target.value }));
    }

    async function salvar() {
        try {
            const fd = new FormData();
            Object.entries(campos).forEach(([k, v]) => fd.append(k, v));
            const resp = await fetch(`${API_URL}/atualizar_chamado/${id}`, {
                method: 'PUT', credentials: 'include', body: fd,
            });
            const data = await resp.json();
            if (!resp.ok) { setErro(data.error || 'Erro ao salvar.'); return; }
            setMensagem('Chamado updated com sucesso!');
            setTimeout(() => navigate(-1), 2000);
        } catch {
            setErro('Erro de conexão com o servidor.');
        }
    }

    return (
        <div className={css.pagina}>
            <main className={css.secao}>
                <div className={css.conteudo}>
                    {erro && <p className={css.erro}>{erro}</p>}
                    {mensagem && <p className={css.sucesso}>{mensagem}</p>}

                    <div className={css.logo}>
                        <img src="/logo2.png" alt="Logo" className={css.logoImg} />
                    </div>

                    <p className={css.subtitulo}>Editar Chamado</p>

                    <div className={css.campos}>
                        <Input label="Sala" type="text" input={campos.sala} alterarInput={alterar('sala')} placeholder="Ex: 101" />
                        <Input label="Patrimônio" type="text" input={campos.patrimonio} alterarInput={alterar('patrimonio')} placeholder="Ex: 1" />
                        <Input label="Título" type="text" input={campos.titulo} alterarInput={alterar('titulo')} placeholder="Ex: infiltração" />

                        {/* Substituição do Input de Descrição pelo Textarea */}
                        <div className={css.campoDescricao}>
                            <label className={css.label}>Descrição</label>
                            <textarea
                                className={css.textarea}
                                value={campos.descricao}
                                onChange={alterar('descricao')}
                                placeholder="Descreva o ocorrido"
                                rows="4"
                            />
                        </div>

                        <InputSelect label="Situação" valor={campos.situacao} alterarValor={alterar('situacao')} opcoes={SITUACOES} />
                    </div>

                    <div className={css.botoes}>
                        <Botao cor="Azul" texto="Salvar alterações" acao={salvar} />
                        <Botao cor="Branco" texto="Voltar" acao={() => navigate(-1)} />
                    </div>
                </div>
            </main>
        </div>
    );
}