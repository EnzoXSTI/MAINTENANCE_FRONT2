import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Pages/Login.jsx";
import Cadastrar from "./Pages/Cadastrar.jsx";
import Verificar from "./Pages/Verificar.jsx";
import EnviarCode from "./Pages/EnviarCode.jsx";
import Redefinir from "./Pages/Redefinir.jsx";
import EditarProf from "./Pages/EditarProf.jsx";
import DashboardP from "./Pages/DashboardP.jsx";
import DashboardA from "./Pages/DashboardA.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import Header from "./Components/Header/Header.jsx";
import EditarPerfilAdm from "./Components/EditarAdm/EditarPerfilAdm.jsx";
import CadastrarTecnico from "./Components/CadastrarTec/CadastrarTecnico.jsx";
import EditarPerfilTecnico from "./Components/EditarTec/EditarPerfilTecnico.jsx";
import DashboardTecnico from "./Components/DashboardTec/DashboardTecnico.jsx";
import CadastrarAdm from "./Components/CadastrarAdm/CadastrarAdm.jsx";
export default function App() {
    return (
        <BrowserRouter>
            <Header />

            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/verificacao" element={<Verificar />} />
                <Route path="/enviarcodigo" element={<EnviarCode />} />
                <Route path="/redefinir-senha" element={<Redefinir />} />

                {/* Professor */}
                <Route path="/DashboardProfessor" element={<DashboardP />} />
                <Route path="/editarPro/:id" element={<EditarProf />} />
                <Route path="/cadastrarPro" element={<Cadastrar />} />

                {/* Técnico */}
                <Route path="/DashboardTec" element={<DashboardTecnico />} />
                <Route path="/cadastrarTec" element={<CadastrarTecnico />} />
                {/* Sem :id = editar o próprio perfil; Com :id = ADM editando outro usuário */}
                <Route path="/EditarTec" element={<EditarPerfilTecnico />} />
                <Route path="/EditarTec/:id" element={<EditarPerfilTecnico />} />

                {/* ADM */}
                <Route path="/DashboardADM" element={<DashboardA />} />
                <Route path="/cadastrarAdm" element={<CadastrarAdm />} />
                <Route path="/EditarAdm" element={<EditarPerfilAdm />} />
                <Route path="/EditarAdm/:id" element={<EditarPerfilAdm />} />
            </Routes>

            <Footer />
        </BrowserRouter>
    );
}
