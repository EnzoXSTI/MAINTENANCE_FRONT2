import { useState, useEffect } from "react";
import css from './EditarPerfil.module.css';
import Input from "../../Components/Input/Input.jsx";
import InputArquivo from "../../Components/InputArquivo/InputArquivo.jsx";
import Botao from "../../Components/Botao/Botao.jsx";
import Footer from "../../Components/Footer/Footer.jsx";
import Header from "../../Components/Header/Header.jsx";
import { useNavigate } from "react-router-dom";

export default function EditarPerfil() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [foto, setFoto] = useState(null);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(true);

    const navigate = useNavigate();
    const idUsuario = localStorage.getItem('id_usuario');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!erro && !mensagem) return;
        const timer = setTimeout(() => {
            setErro('');
            setMensagem('');
        }, 8000);
        return () => clearTimeout(timer);
    }, [erro, mensagem]);

    useEffect(() => {
        if (!idUsuario) {
            navigate('/');
            return;
        }

        async function carregarUsuario() {
            try {
                const resposta = await fetch(`http://192.168.1.102:5000/buscar_usuarios/${idUsuario}`, {
                    credentials: 'include',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const dados = await resposta.json();

                if (resposta.ok) {
                    setNome(dados.usuario.nome);
                    setEmail(dados.usuario.email);
                } else {
                    setErro("Não foi possível carregar os dados do perfil.");
                }
            } catch {
                setErro("Erro de conexão com o servidor.");
            } finally {
                setCarregando(false);
            }
        }

        carregarUsuario();
    }, [idUsuario]);

    async function editar() {
        setErro('');
        setMensagem('');

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('email', email);

        if (foto) formData.append('foto_perfil', foto);

        try {
            const resposta = await fetch(`http://192.168.1.102:5000/editar_usuarios/${idUsuario}`, {
                method: 'PUT',
                body: formData,
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                setMensagem("Perfil atualizado com sucesso!");
                setTimeout(() => navigate('/DashboardProfessor'), 2000);
            } else {
                setErro(dados.error || "Erro ao atualizar perfil.");
            }
        } catch {
            setErro("Erro de conexão com o servidor.");
        }
    }

    if (carregando) {
        return (
            <div className={css.pagina}>
                <Header />
                <main className={css.secao}>
                    <p style={{ color: '#5aabdd', textAlign: 'center' }}>Carregando...</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className={css.pagina}>

            {erro && (
                <div className={`${css.toast} ${css.toastErro}`}>
                    <span>{erro}</span>
                    <button className={css.toastFechar} onClick={() => setErro('')}>✕</button>
                </div>
            )}
            {mensagem && (
                <div className={`${css.toast} ${css.toastSucesso}`}>
                    <span>{mensagem}</span>
                    <button className={css.toastFechar} onClick={() => setMensagem('')}>✕</button>
                </div>
            )}

            <Header />

            <main className={css.secao}>
                <div className={css.conteudo}>
                    <div className={css.logo}>
                        <img src="/logo2.png" alt="Logo" className={css.logoImg} />
                        <span className={css.logoTexto}>MAINTENANCE</span>
                    </div>

                    <p className={css.subtitulo}>Edite seu Perfil</p>

                    <div className={css.campos}>
                        <Input label="Nome" type="text" input={nome}
                            alterarInput={(e) => setNome(e.target.value)}
                            placeholder="Ex: nome sobrenome" />
                        <Input label="E-mail" type="email" input={email}
                            alterarInput={(e) => setEmail(e.target.value)}
                            placeholder="Ex: usuario@gmail.com" />
<InputArquivo label="Foto de perfil"
                            alterarInput={(e) => setFoto(e.target.files[0])} />
                    </div>

                    <div className={css.botoes}>
                        <Botao cor="Azul" texto="Salvar alterações" acao={editar} />
                        <Botao cor="Branco" texto="Voltar para Dashboard" pagina="/home" />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
