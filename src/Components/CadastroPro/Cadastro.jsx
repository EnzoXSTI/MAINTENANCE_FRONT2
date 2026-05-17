import { useState, useEffect } from "react";
import css from './Cadastro.module.css';
import Input from "../../Components/Input/Input.jsx";
import InputArquivo from "../../Components/InputArquivo/InputArquivo.jsx";
import Botao from "../../Components/Botao/Botao.jsx";
import Footer from "../../Components/Footer/Footer.jsx";
import Header from "../../Components/Header/Header.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function Cadastro() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('1');
    const [foto, setFoto] = useState(null);
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        if (!erro && !mensagem) return;
        const timer = setTimeout(() => {
            setErro('');
            setMensagem('');
        }, 8000);
        return () => clearTimeout(timer);
    }, [erro, mensagem]);

    async function cadastrar() {
        setErro('');
        setMensagem('');

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('email', email);
        formData.append('senha', senha);
        formData.append('confirmar_senha', confirmarSenha);
        formData.append('tipo', tipoUsuario);
        if (foto) formData.append('foto_perfil', foto);

        try {
            const resposta = await fetch('http://192.168.1.102:5000/criar_usuarios', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                setMensagem(dados.message);
                localStorage.setItem('email_recuperacao', email);
                setTimeout(() => navigate('/verificacao?fluxo=cadastro'), 2000);
            } else {
                setErro(dados.error);
            }

        } catch (e) {
            setErro('Não foi possível conectar com o servidor.');
        }
    }

    return (
        <div className={css.pagina}>

            <Header />

            <main className={css.secao}>


            {erro && (
                <div className={`${css.toast} ${css.toastErro}`}>
                    <span>{erro}</span>
                </div>
            )}
            {mensagem && (
                <div className={`${css.toast} ${css.toastSucesso}`}>
                    <span>{mensagem}</span>
                </div>
            )}
<div className={css.conteudoFormulario}>

                    <div className={css.logo}>
                        <img src="/logo2.png" alt="Logo" className={css.logoImg} />
                    </div>

                    <p className={css.subtitulo}>Faça seu Cadastro</p>

                    <div className={css.campos}>
                        <Input label="Nome" type="text" input={nome}
                            alterarInput={(e) => setNome(e.target.value)}
                            placeholder="Ex: nome sobrenome" />
                        <Input label="E-mail" type="email" input={email}
                            alterarInput={(e) => setEmail(e.target.value)}
                            placeholder="Ex: usuario@gmail.com" />
                        <Input label="Senha" type="password" input={senha}
                            alterarInput={(e) => setSenha(e.target.value)}
                            placeholder="Ex: Senha@123" />
                        <Input label="Confirmar Senha" type="password" input={confirmarSenha}
                            alterarInput={(e) => setConfirmarSenha(e.target.value)}
                            placeholder="Ex: Senha@123" />
                        <InputArquivo label="Foto de perfil"
                            alterarInput={(e) => setFoto(e.target.files[0])} />
                    </div>

                    <div className={css.areaBotao}>
                        <Botao cor="Azul" texto="Cadastrar-se" acao={cadastrar} />
                    </div>

                    <div className={css.footerCadastro}>
                        <span>Já tem uma conta? </span>
                        <Link to="/" className={css.linkLogin}>Login</Link>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
