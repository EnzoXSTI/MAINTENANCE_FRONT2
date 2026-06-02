import { useState, useEffect } from "react";
import css from './CadastroChamado.module.css';
import Input from "../../Components/Input/Input.jsx";
import InputArquivo from "../../Components/InputArquivo/InputArquivo.jsx";
import InputSelect from "../../Components/Select/InputSelect.jsx";
import Botao from "../../Components/Botao/Botao.jsx";

const API_URL = 'http://localhost:5000';
const SITUACOES = ['Aguardando', 'Em andamento', 'Finalizado'];

export default function CadastroChamado({ onCadastroConcluido }) {
    const [sala,       setSala]       = useState('');
    const [patrimonio, setPatrimonio] = useState('');
    const [titulo,     setTitulo]     = useState('');
    const [descricao,  setDescricao]  = useState('');
    const [situacao,   setSituacao]   = useState('');
    const [foto,       setFoto]       = useState(null);
    const [erro,       setErro]       = useState('');
    const [mensagem,   setMensagem]   = useState('');
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        if (!erro && !mensagem) return;
        const t = setTimeout(() => { setErro(''); setMensagem(''); }, 8000);
        return () => clearTimeout(t);
    }, [erro, mensagem]);

    async function cadastrar() {
        setErro('');
        setMensagem('');

        if (!sala.trim() || !titulo.trim() || !descricao.trim() || !situacao) {
            setErro('Preencha todos os campos obrigatórios.');
            return;
        }

        setCarregando(true);

        try {
            const formData = new FormData();
            formData.append('sala',       sala.trim());
            formData.append('patrimonio', patrimonio.trim());
            formData.append('titulo',     titulo.trim());
            formData.append('descricao',  descricao.trim());
            formData.append('situacao',   situacao);
            if (foto) formData.append('foto', foto);

            const resp = await fetch(`${API_URL}/criar_chamado`, {
                method: 'POST',
                credentials: 'include',  // envia o cookie acess_token
                body: formData,
            });

            const data = await resp.json();

            if (!resp.ok) {
                setErro(data.error || 'Erro ao cadastrar chamado.');
                return;
            }

            setMensagem('Chamado cadastrado com sucesso!');
            setSala('');
            setPatrimonio('');
            setTitulo('');
            setDescricao('');
            setSituacao('');
            setFoto(null);

            if (onCadastroConcluido) onCadastroConcluido();

        } catch (e) {
            setErro('Erro de conexão com o servidor.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className={css.container}>
            <h2 className={css.titulo}>Cadastro de Chamados</h2>
            <p className={css.subtitulo}>Cadastre sua Chamada de Manutenção</p>

            {erro     && <p className={css.erro}>{erro}</p>}
            {mensagem && <p className={css.sucesso}>{mensagem}</p>}

            <div className={css.campos}>
                <Input label="Sala *" type="text" input={sala}
                    alterarInput={e => setSala(e.target.value)}
                    placeholder="Ex: 101" />

                <Input label="Patrimônio" type="text" input={patrimonio}
                    alterarInput={e => setPatrimonio(e.target.value)}
                    placeholder="Ex: 1" />

                <Input label="Título *" type="text" input={titulo}
                    alterarInput={e => setTitulo(e.target.value)}
                    placeholder="Ex: infiltração" />

                <Input label="Descrição *" type="text" input={descricao}
                    alterarInput={e => setDescricao(e.target.value)}
                    placeholder="Me especifique o ocorrido"
                    gordo />

                <InputSelect
                    label="Situação *"
                    valor={situacao}
                    alterarValor={e => setSituacao(e.target.value)}
                    opcoes={SITUACOES}
                />

                <InputArquivo label="Foto do Acontecido"
                    alterarInput={e => setFoto(e.target.files[0])} />
            </div>

            <Botao
                cor="Azul"
                texto={carregando ? 'Cadastrando...' : 'Cadastrar'}
                acao={cadastrar}
                disabled={carregando}
            />
        </div>
    );
}
