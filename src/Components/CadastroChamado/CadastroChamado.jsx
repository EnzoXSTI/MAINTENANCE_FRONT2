import { useState, useEffect } from "react";
import css from './CadastroChamado.module.css';
import Input from "../../Components/Input/Input.jsx";
import InputArquivo from "../../Components/InputArquivo/InputArquivo.jsx";
import Botao from "../../Components/Botao/Botao.jsx";

const API_URL = 'http://localhost:5000';
const CAMPOS_INICIAIS = { sala: '', patrimonio: '', titulo: '', descricao: '', situacao: 'Aguardando' };

export default function CadastroChamado({ onCadastroConcluido }) {
    const [campos, setCampos] = useState(CAMPOS_INICIAIS);
    const [foto, setFoto] = useState(null);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    useEffect(() => {
        if (!erro && !mensagem) return;
        const t = setTimeout(() => { setErro(''); setMensagem(''); }, 8000);
        return () => clearTimeout(t);
    }, [erro, mensagem]);

    function alterar(campo) {
        return e => setCampos(prev => ({ ...prev, [campo]: e.target.value }));
    }

    async function cadastrar() {
        const { sala, titulo, descricao } = campos;
        if (!sala.trim() || !titulo.trim() || !descricao.trim()) {
            setErro('Preencha todos os campos obrigatórios.');
            return;
        }
        try {
            const fd = new FormData();
            Object.entries(campos).forEach(([k, v]) => fd.append(k, v.trim ? v.trim() : v));
            if (foto) fd.append('foto', foto);

            const resp = await fetch(`${API_URL}/criar_chamado`, {
                method: 'POST', credentials: 'include', body: fd,
            });
            const data = await resp.json();
            if (!resp.ok) { setErro(data.error || 'Erro ao cadastrar chamado.'); return; }

            setMensagem('Chamado cadastrado com sucesso!');
            setCampos(CAMPOS_INICIAIS);
            setFoto(null);
            onCadastroConcluido?.();
        } catch {
            setErro('Erro de conexão com o servidor.');
        }
    }

    return (
        <div className={css.container}>
            <h2 className={css.titulo}>Cadastro de Chamados</h2>
            <p className={css.subtitulo}>Cadastre sua Chamada de Manutenção</p>

            {erro && <p className={css.erro}>{erro}</p>}
            {mensagem && <p className={css.sucesso}>{mensagem}</p>}

            <div className={css.campos}>
                <Input label="Sala" type="text" input={campos.sala} alterarInput={alterar('sala')} placeholder="Ex: 101"/>
                <Input label="Patrimônio" type="text" input={campos.patrimonio} alterarInput={alterar('patrimonio')} placeholder="Ex: 1" />
                <Input label="Título" type="text" input={campos.titulo} alterarInput={alterar('titulo')} placeholder="Ex: infiltração" />

                <div className={css.campoDescricao}>
                    <label className={css.label}>Descrição</label>
                    <textarea
                        className={css.textarea}
                        value={campos.descricao}
                        onChange={alterar('descricao')}
                        placeholder="Me especifique o ocorrido"
                        rows="4"
                    />
                </div>

                <InputArquivo label="Foto do Acontecido" alterarInput={e => setFoto(e.target.files[0])} />
            </div>

            <Botao cor="Azul" texto="Cadastrar" acao={cadastrar} />
        </div>
    );
}
