import { useState, useEffect } from "react";
import css from './VerificacaoCodigo.module.css';
import Input from "../../Components/Input/Input.jsx";
import Botao from "../../Components/Botao/Botao.jsx";
import Footer from "../../Components/Footer/Footer.jsx";
import Header from "../../Components/Header/Header.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function VerificacaoCodigo() {
    const [codigo, setCodigo] = useState('');
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fluxo = searchParams.get('fluxo') || 'senha';

    useEffect(() => {
        if (!erro && !mensagem) return;
        const timer = setTimeout(() => {
            setErro('');
            setMensagem('');
        }, 8000);
        return () => clearTimeout(timer);
    }, [erro, mensagem]);

    async function verificarCodigo(e) {
        if (e) e.preventDefault();
        setErro('');
        setMensagem('');

        const email = localStorage.getItem('email_recuperacao');

        if (!email) {
            setErro("E-mail não encontrado. Volte e solicite o código novamente.");
            return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('codigo', codigo);

        try {
            const rota = fluxo === 'cadastro'
                ? 'http://192.168.1.102:5000/confirmar_email'
                : 'http://192.168.1.102:5000/verificar_codigo';

            const resposta = await fetch(rota, { method: 'POST', body: formData });
            const dados = await resposta.json();

            if (resposta.ok) {
                setMensagem("Código verificado com sucesso!");
                if (fluxo === 'senha' && dados.token) {
                    localStorage.setItem('reset_token', dados.token);
                }
                setTimeout(() => {
                    if (fluxo === 'cadastro') {
                        localStorage.removeItem('email_recuperacao');
                        navigate('/');
                    } else {
                        navigate('/redefinir-senha');
                    }
                }, 1500);
            } else {
                setErro(dados.error || "Código inválido ou expirado.");
            }
        } catch (error) {
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
                    </div>
                    <h2 className={css.titulo}>Verificação de código</h2>
                    <p className={css.descricao}>
                        {fluxo === 'cadastro'
                            ? 'Enviamos um código de 6 dígitos para confirmar seu cadastro.'
                            : 'Enviamos um código de 6 dígitos para recuperar sua senha.'}
                        {' '}Digite abaixo para continuar.
                    </p>
                    <div className={css.campos}>
                        <Input
                            type="text"
                            input={codigo}
                            alterarInput={(e) => setCodigo(e.target.value)}
                            placeholder="Ex: 123456"
                        />
                    </div>
                    <div className={css.botoes}>
                        <Botao cor="Azul" texto="Verificar código" acao={verificarCodigo} />
                        <Botao cor="Branco" texto="Mudar E-mail" pagina="/enviarcodigo" />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
