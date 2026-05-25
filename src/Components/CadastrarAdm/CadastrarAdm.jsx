import { useState, useEffect } from "react";
import css from './CadastrarAdm.module.css';
import Input from "../../Components/Input/Input.jsx";
import Botao from "../../Components/Botao/Botao.jsx";
import { useNavigate } from "react-router-dom";

const BASE_URL = 'http://10.92.3.149:5000';

export default function CadastrarAdm() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const tipoUsuario = parseInt(localStorage.getItem('tipo_usuario'));

    // Apenas ADM (tipo === 0) pode acessar esta página
    useEffect(() => {
        if (tipoUsuario !== 0) {
            navigate('/');
        }
    }, [tipoUsuario, navigate]);

    useEffect(() => {
        if (!erro && !mensagem) return;
        const timer = setTimeout(() => { setErro(''); setMensagem(''); }, 8000);
        return () => clearTimeout(timer);
    }, [erro, mensagem]);

    async function cadastrar() {
        setErro('');
        setMensagem('');

        if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
            setErro("Preencha todos os campos obrigatórios.");
            return;
        }

        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem.");
            return;
        }

        setCarregando(true);

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('email', email);
        formData.append('senha', senha);
        formData.append('confirmar_senha', confirmarSenha);
        formData.append('tipo', '0');

        try {
            const resposta = await fetch(`${BASE_URL}/criar_usuarios`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dados = await resposta.json();

            if (resposta.ok) {
                setMensagem("Administrador cadastrado com sucesso!");
                setNome('');
                setEmail('');
                setSenha('');
                setConfirmarSenha('');
                setTimeout(() => navigate('/DashboardADM'), 2000);
            } else {
                setErro(dados.error || "Erro ao cadastrar administrador.");
            }
        } catch {
            setErro("Erro de conexão com o servidor.");
        } finally {
            setCarregando(false);
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

                    <p className={css.subtitulo}>Cadastrar Administrador</p>

                    <div className={css.campos}>
                        <Input
                            label="Nome"
                            type="text"
                            input={nome}
                            alterarInput={(e) => setNome(e.target.value)}
                            placeholder="Ex: nome sobrenome"
                        />

                        <Input
                            label="E-mail"
                            type="email"
                            input={email}
                            alterarInput={(e) => setEmail(e.target.value)}
                            placeholder="Ex: adm@gmail.com"
                        />

                        <Input
                            label="Senha"
                            type="password"
                            input={senha}
                            alterarInput={(e) => setSenha(e.target.value)}
                            placeholder="Digite a senha"
                        />

                        <Input
                            label="Confirmar Senha"
                            type="password"
                            input={confirmarSenha}
                            alterarInput={(e) => setConfirmarSenha(e.target.value)}
                            placeholder="Confirme a senha"
                        />

                    </div>

                    <div className={css.botoes}>
                        <Botao
                            cor="Azul"
                            texto={carregando ? "Cadastrando..." : "Cadastrar Administrador"}
                            acao={cadastrar}
                        />
                        <Botao
                            cor="Branco"
                            texto="Voltar para Dashboard"
                            pagina="/DashboardAdm"
                        />
                    </div>

                </div>
            </main>
        </div>
    );
}
