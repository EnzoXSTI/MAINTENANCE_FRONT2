import { useState, useEffect } from "react";
import css from './Login.module.css';
import Input from "../../Components/Input/Input.jsx";
import Botao from "../../Components/Botao/Botao.jsx";
import Footer from "../../Components/Footer/Footer.jsx";
import Header from "../../Components/Header/Header.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        if (!erro && !mensagem) return;
        const timer = setTimeout(() => { setErro(''); setMensagem(''); }, 8000);
        return () => clearTimeout(timer);
    }, [erro, mensagem]);

    async function fazerLogin() {
        setErro('');
        setMensagem('');

        const formData = new FormData();
        formData.append('email', email);
        formData.append('senha', senha);

        try {
            const resposta = await fetch('http://10.92.3.147:5000/login', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                localStorage.setItem('id_usuario', dados.usuario.id);
                localStorage.setItem('token', dados.token);
                localStorage.setItem('tipo_usuario', dados.usuario.tipo); // ← adicionar isso

                if (dados.usuario.tipo === 0) {
                    navigate('/DashboardAdm');
                } else {
                    navigate('/DashboardProfessor');
                }
            } else {
                setErro(dados.error || "Erro ao efetuar login.");
            }
        } catch {
            setErro("Erro de conexão com o servidor.");
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

                    <p className={css.subtitulo}>faça seu login</p>

                    <div className={css.campos}>
                        <Input label="E-mail" type="email" input={email}
                            alterarInput={(e) => setEmail(e.target.value)}
                            placeholder="Ex: usuario@gmail.com" />
                        <div>
                            <Input label="Senha" type="password" input={senha}
                                alterarInput={(e) => setSenha(e.target.value)}
                                placeholder="Ex: Senha@123" />
                            <Link to="/enviarcodigo" className={css.linkEsqueci}>Esqueci minha senha</Link>
                        </div>
                    </div>

                    <div className={css.areaBotao}>
                        <Botao cor="Azul" texto="Entrar" acao={fazerLogin} />
                    </div>

                    <div className={css.footerLogin}>
                        <span>Não tem uma conta ? </span>
                        <Link to="/cadastro" className={css.linkCadastro}>Cadastrar-se</Link>
                    </div>

                </div>
            </main>
        </div>
    );
}
