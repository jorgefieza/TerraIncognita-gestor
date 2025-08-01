import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Importar o nosso hook

const LoginScreen = () => {
    const { login } = useAuth(); // Usar a função de login do nosso contexto
    const [selectedRole, setSelectedRole] = useState('diretor');
    const [logoError, setLogoError] = useState(false);
    const logoUrl = "https://exemplo.com/logo.png"; // Placeholder

    const handleLogin = () => {
        login(selectedRole);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center h-24 flex items-center justify-center">
                    {logoError ? (
                        <h2 className="text-3xl font-bold text-gray-900">Terra Incógnita</h2>
                    ) : (
                        <img
                            src={logoUrl}
                            alt="Logomarca"
                            className="max-h-24 mx-auto"
                            onError={() => setLogoError(true)}
                        />
                    )}
                </div>
                <div className="space-y-6">
                    <div><label className="text-sm font-bold text-gray-700 tracking-wide">Email</label><input className="w-full content-center text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500" type="email" placeholder="mail@exemplo.com" disabled /></div>
                    <div><label className="text-sm font-bold text-gray-700 tracking-wide">Senha</label><input className="w-full content-center text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500" type="password" placeholder="********" disabled /></div>

                    <div className="pt-2">
                        <label className="text-sm font-bold text-gray-700 tracking-wide">Papel (Simulação)</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full mt-2 content-center text-base py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                        >
                            <option value="diretor">Diretor</option>
                            <option value="coordenador">Coordenador</option>
                            <option value="colaborador">Colaborador</option>
                        </select>
                    </div>

                    <div><button onClick={handleLogin} className="w-full flex justify-center bg-indigo-600 text-gray-100 p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300">Entrar</button></div>
                </div>
            </div>
        </div>
    );
};


const AuthModule = () => {
    return <LoginScreen />;
};

export default AuthModule;