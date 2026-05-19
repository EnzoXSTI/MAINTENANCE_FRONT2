import { useState, useEffect } from "react";
import css from './EditarPerfil.module.css';
import Input from "../../Components/Input/Input.jsx";
import InputArquivo from "../../Components/InputArquivo/InputArquivo.jsx";
import Botao from "../../Components/Botao/Botao.jsx";
import { useNavigate } from "react-router-dom";

export default function EditarPerfil() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [foto, setFoto] = useState(null);
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

    const navigate = useNavigate();
    const idUsuario = localStorage.getItem('id_usuario');

    useEffect(() => {
        if (!erro && !mensagem) return;
        const timer = setTimeout(() => { setErro(''); setMensagem(''); }, 8000);
        return () => clearTimeout(timer);
    }, [erro, mensagem]);

    useEffect(() => {
        if (!idUsuario) { navigate('/'); return; }

        async function carregarUsuario() {
            try {
                const resposta = await fetch(`http://192.168.1.124:5000/buscar_usuarios/${idUsuario}`, {
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
            }
        }

        carregarUsuario();
    }, [idUsuario, navigate]);

    async function editar() {
        setErro('');
        setMensagem('');

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('email', email);
        if (foto) formData.append('foto_perfil', foto);

        // Se o usuário preencheu algum campo de senha
        if (senha || confirmarSenha) {
            if (senha !== confirmarSenha) {
                setErro("As senhas não coincidem.");
                return;
            }

            // Enviando as chaves exatas que o seu backend (usuario.py) espera
            formData.append('senha', senha);
            formData.append('confirmar_senha', confirmarSenha);
        }

        try {
            const resposta = await fetch(`http://192.168.1.124:5000/editar_usuarios/${idUsuario}`, {
                method: 'PUT',
                body: formData,
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const dados = await resposta.json();
            if (resposta.ok) {
                setMensagem("Perfil atualizado com sucesso!");
                // Limpa os campos de senha após o sucesso
                setSenha('');
                setConfirmarSenha('');
                setTimeout(() => navigate('/DashboardProfessor'), 2000);
            } else {
                // Exibe as mensagens detalhadas do back-end (Ex: senha fraca, senha antiga já usada...)
                setErro(dados.error || "Erro ao atualizar perfil.");
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

                    <p className={css.subtitulo}>Edite seu Perfil</p>

                    <div className={css.campos}>
                        <Input label="Nome" type="text" input={nome}
                               alterarInput={(e) => setNome(e.target.value)}
                               placeholder="Ex: nome sobrenome" />

                        <Input label="E-mail" type="email" input={email}
                               alterarInput={(e) => setEmail(e.target.value)}
                               placeholder="Ex: usuario@gmail.com" />

                        <Input label="Nova Senha (Opicional)" type="password" input={senha}
                               alterarInput={(e) => setSenha(e.target.value)}
                               placeholder="Digite a nova senha" />

                        <Input label="Confirmar Nova Senha" type="password" input={confirmarSenha}
                               alterarInput={(e) => setConfirmarSenha(e.target.value)}
                               placeholder="Confirme a nova senha" />

                        <InputArquivo label="Foto de perfil"
                                      alterarInput={(e) => setFoto(e.target.files[0])} />
                    </div>

                    <div className={css.botoes}>
                        <Botao cor="Azul" texto="Salvar alterações" acao={editar} />
                        <Botao cor="Branco" texto="Voltar para Dashboard" pagina="/DashboardProfessor" />
                    </div>

                </div>
            </main>
        </div>
    );
}