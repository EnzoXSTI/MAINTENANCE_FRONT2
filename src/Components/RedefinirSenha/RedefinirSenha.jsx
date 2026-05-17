import { useState, useEffect } from "react";
import css from './RedefinirSenha.module.css';
import Input from "../../Components/Input/Input.jsx";
import Botao from "../../Components/Botao/Botao.jsx";
import Footer from "../../Components/Footer/Footer.jsx";
import Header from "../../Components/Header/Header.jsx";
import { useNavigate } from "react-router-dom";

export default function RedefinirSenha() {
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
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

    async function alterarSenha(e) {
        if (e) e.preventDefault();
        setErro('');
        setMensagem('');

        const token = localStorage.getItem('reset_token');

        if (!token) {
            setErro("Sessão expirada. Solicite um novo código de recuperação.");
            return;
        }

        const formData = new FormData();
        formData.append('nova_senha', senha);
        formData.append('confirmar_senha', confirmarSenha);

        try {
            const resposta = await fetch('http://192.168.1.102:5000/redefinir_senha', {
                method: 'POST',
                body: formData,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                setMensagem("Senha alterada com sucesso!");
                localStorage.removeItem('reset_token');
                localStorage.removeItem('email_recuperacao');
                setTimeout(() => navigate('/'), 2000);
            } else {
                setErro(dados.error || "Erro ao alterar a senha.");
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
                        <span className={css.logoTexto}>MAINTENANCE</span>
                    </div>
                    <h2 className={css.titulo}>Redefinir senha</h2>
                    <p className={css.descricao}>Digite a nova senha abaixo e confirme para concluir a recuperação.</p>
                    <div className={css.campos}>
                        <Input
                            label="Nova Senha"
                            type="password"
                            input={senha}
                            alterarInput={(e) => setSenha(e.target.value)}
                            placeholder="Ex: Senha@123"
                        />
                        <Input
                            label="Confirmar Senha"
                            type="password"
                            input={confirmarSenha}
                            alterarInput={(e) => setConfirmarSenha(e.target.value)}
                            placeholder="Ex: Senha@123"
                        />
                    </div>
                    <Botao cor="Azul" texto="Alterar senha" acao={alterarSenha} />
                </div>
            </main>
            <Footer />
        </div>
    );
}
