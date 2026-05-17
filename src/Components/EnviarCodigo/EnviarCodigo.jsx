import { useState, useEffect } from "react";
import css from './EnviarCodigo.module.css';
import Input from "../../Components/Input/Input.jsx";
import Botao from "../../Components/Botao/Botao.jsx";
import Footer from "../../Components/Footer/Footer.jsx";
import Header from "../../Components/Header/Header.jsx";
import { useNavigate } from "react-router-dom";

export default function EnviarCodigo() {
    const [email, setEmail] = useState('');
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        if (!erro && !mensagem) return;
        const timer = setTimeout(() => {
            setErro('');
            setMensagem('');
        }, 8000);
        return () => clearTimeout(timer);
    }, [erro, mensagem]);

    async function solicitarCodigo(e) {
        if (e) e.preventDefault();
        setErro('');
        setMensagem('Enviando e-mail...');

        const formData = new FormData();
        formData.append('email', email);

        try {
            const resposta = await fetch('http://192.168.1.102:5000/esqueci_senha', {
                method: 'POST',
                body: formData
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                localStorage.setItem('email_recuperacao', email);
                setMensagem("Código enviado com sucesso!");
                setTimeout(() => navigate('/verificacao'), 1500);
            } else {
                setMensagem('');
                setErro(dados.error || "Erro ao enviar código.");
            }
        } catch (error) {
            setMensagem('');
            setErro("Erro de conexão com o servidor.");
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
<div className={css.conteudo}>

                    <div className={css.logo}>
                        <img src="/logo2.png" alt="Logo" className={css.logoImg} />
                        <span className={css.logoTexto}>MAINTENANCE</span>
                    </div>

                    <h2 className={css.titulo}>Enviar código para e-mail</h2>
                    <p className={css.descricao}>Informe o e-mail cadastrado para receber o código de recuperação.</p>

                    <div className={css.campos}>
                        <Input
                            type="email"
                            input={email}
                            alterarInput={(e) => setEmail(e.target.value)}
                            placeholder="Ex: usuario@gmail.com"
                        />
                    </div>

                    <div className={css.botoes}>
                        <Botao cor="Azul" texto="Verificar E-mail" acao={solicitarCodigo} />
                        <Botao cor="Branco" texto="Voltar ao Login" pagina="/" />
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
