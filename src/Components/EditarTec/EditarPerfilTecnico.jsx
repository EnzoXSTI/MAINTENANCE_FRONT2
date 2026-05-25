import { useState, useEffect } from "react";
import css from './EditarPerfilTecnico.module.css';
import Input from "../../Components/Input/Input.jsx";
import InputArquivo from "../../Components/InputArquivo/InputArquivo.jsx";
import Botao from "../../Components/Botao/Botao.jsx";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = 'http://10.92.3.149:5000';

export default function EditarPerfilTecnico() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [foto, setFoto] = useState(null);
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [emailOriginal, setEmailOriginal] = useState('');

    const navigate = useNavigate();
    const { id } = useParams();

    // Se vier :id na rota (ADM editando), usa esse. Senão, é o próprio técnico editando.
    const idAlvo = id || localStorage.getItem('id_usuario');
    const token = localStorage.getItem('token');
    const editandoOutro = !!id; // true quando o ADM está editando outra pessoa

    useEffect(() => {
        if (!idAlvo) { navigate('/'); return; }

        async function carregarUsuario() {
            try {
                const r = await fetch(`${BASE_URL}/buscar_usuarios/${idAlvo}`, {
                    credentials: 'include',
                    headers: { Authorization: `Bearer ${token}` },
                });
                const d = await r.json();
                if (r.ok) {
                    setEmailOriginal(d.usuario.email);
                    setEmailOriginal(d.usuario.email);
                    setNome(d.usuario.nome);
                    setEmail(d.usuario.email);
                } else {
                    setErro('Não foi possível carregar os dados do perfil.');
                }
            } catch {
                setErro('Erro de conexão com o servidor.');
            }
        }

        carregarUsuario();
    }, [idAlvo]);

    useEffect(() => {
        if (!erro && !mensagem) return;
        const t = setTimeout(() => { setErro(''); setMensagem(''); }, 8000);
        return () => clearTimeout(t);
    }, [erro, mensagem]);

    async function editar() {
        setErro('');
        setMensagem('');

        if (senha || confirmarSenha) {
            if (senha !== confirmarSenha) {
                setErro('As senhas não coincidem.');
                return;
            }
        }

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('email', email);
        if (foto) formData.append('foto_perfil', foto);
        if (senha) {
            formData.append('senha', senha);
            formData.append('confirmar_senha', confirmarSenha);
        }

        try {
            const r = await fetch(`${BASE_URL}/editar_usuarios/${idAlvo}`, {
                method: 'PUT',
                body: formData,
                credentials: 'include',
                headers: { Authorization: `Bearer ${token}` },
            });
            const d = await r.json();
            if (r.ok) {
                setMensagem('Perfil atualizado com sucesso!');
                setSenha('');
                setConfirmarSenha('');
                if (d.email_mudou) {
                    localStorage.setItem('email_recuperacao', email);
                    setTimeout(() => navigate('/verificacao?fluxo=cadastro&origem=adm'), 1500);
                } else {
                    setTimeout(() => navigate(editandoOutro ? '/DashboardADM' : '/DashboardTec'), 2000);
                }
            } else {
                setErro(d.error || 'Erro ao atualizar perfil.');
            }
        } catch {
            setErro('Erro de conexão com o servidor.');
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

                    <p className={css.subtitulo}>Edite seu Perfil</p>

                    <div className={css.campos}>
                        <Input label="Nome" type="text" input={nome}
                               alterarInput={e => setNome(e.target.value)}
                               placeholder="Ex: nome sobrenome" />

                        <Input label="E-mail" type="email" input={email}
                               alterarInput={e => setEmail(e.target.value)}
                               placeholder="Ex: usuario@gmail.com" />

                        <Input label="Nova Senha (Opcional)" type="password" input={senha}
                               alterarInput={e => setSenha(e.target.value)}
                               placeholder="Digite a nova senha" />

                        <Input label="Confirmar Nova Senha" type="password" input={confirmarSenha}
                               alterarInput={e => setConfirmarSenha(e.target.value)}
                               placeholder="Confirme a nova senha" />

                        <InputArquivo label="Foto de perfil"
                                      alterarInput={e => setFoto(e.target.files[0])} />
                    </div>

                    <div className={css.botoes}>
                        <Botao cor="Azul" texto="Salvar alterações" acao={editar} />
                        <Botao cor="Branco"
                               texto={editandoOutro ? 'Voltar para Dashboard ADM' : 'Voltar para Dashboard'}
                               pagina={editandoOutro ? '/DashboardADM' : '/DashboardTec'} />
                    </div>
                </div>
            </main>
        </div>
    );
}
