import React, { useState } from 'react';
import { Sparkles, ArrowRight, User as UserIcon, Mail, Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

type AuthView = 'LOGIN' | 'REGISTER' | 'FORGOT_PASS';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Simula um pequeno delay de rede para UX
    await new Promise(r => setTimeout(r, 600));

    try {
      if (view === 'LOGIN') {
        const user = authService.login(formData.email, formData.password);
        onLogin(user);
      } else if (view === 'REGISTER') {
        if (!formData.name || !formData.email || !formData.password) {
            throw new Error('Preencha todos os campos.');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        if (formData.password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }
        const user = authService.register(formData.name, formData.email, formData.password);
        setSuccess('Conta criada com sucesso! Entrando...');
        setTimeout(() => onLogin(user), 1000);
      } else if (view === 'FORGOT_PASS') {
        if (!formData.email || !formData.password) {
             throw new Error('Preencha o email e a nova senha.');
        }
        if (formData.password.length < 6) {
            throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
        }
        authService.resetPassword(formData.email, formData.password);
        setSuccess('Senha redefinida com sucesso! Faça login com a nova senha.');
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setTimeout(() => setView('LOGIN'), 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-600/20 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 transform rotate-3">
             <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Alex Souza</h1>
            <p className="text-slate-400 mt-2 font-medium">Agência de Marketing e Criação de Conteúdo</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">
                {view === 'LOGIN' && 'Acessar Agência'}
                {view === 'REGISTER' && 'Criar Conta'}
                {view === 'FORGOT_PASS' && 'Recuperar Senha'}
            </h2>
            <p className="text-sm text-slate-400">
                {view === 'LOGIN' && 'Entre para gerenciar sua marca.'}
                {view === 'REGISTER' && 'Comece gratuitamente hoje.'}
                {view === 'FORGOT_PASS' && 'Defina uma nova senha.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {view === 'REGISTER' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1">Nome Completo</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    name="name"
                    type="text"
                    placeholder="Ex: João Silva"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 ml-1">
                {view === 'FORGOT_PASS' && 'Nova '}Senha
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  name="password"
                  type="password"
                  placeholder="******"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {view === 'REGISTER' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1">Confirmar Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="******"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
             {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-200 text-sm text-center font-medium animate-in fade-in slide-in-from-top-1">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold tracking-wide transition-all shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processando...' : (
                <>
                  {view === 'LOGIN' && 'Entrar'}
                  {view === 'REGISTER' && 'Cadastrar'}
                  {view === 'FORGOT_PASS' && 'Redefinir Senha'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Navigation Links */}
          <div className="mt-8 flex flex-col gap-3 text-center">
            {view === 'LOGIN' && (
              <>
                <button 
                    onClick={() => { setError(null); setView('FORGOT_PASS'); }} 
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Esqueci minha senha
                </button>
                <div className="w-full h-[1px] bg-white/5 my-2"></div>
                <div className="text-sm text-slate-500">
                  Novo por aqui?{' '}
                  <button 
                    onClick={() => { setError(null); setView('REGISTER'); }} 
                    className="text-pink-400 hover:text-pink-300 font-bold ml-1 hover:underline"
                  >
                    Criar conta
                  </button>
                </div>
              </>
            )}

            {view === 'REGISTER' && (
              <div className="text-sm text-slate-500 mt-2">
                Já tem cadastro?{' '}
                <button 
                    onClick={() => { setError(null); setView('LOGIN'); }} 
                    className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 hover:underline"
                >
                  Fazer login
                </button>
              </div>
            )}

            {view === 'FORGOT_PASS' && (
              <button 
                onClick={() => { setError(null); setView('LOGIN'); }} 
                className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-full mt-2"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para o login
              </button>
            )}
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-xs mt-8">
            &copy; 2025 Alex Souza - Agência de Marketing e Criação de Conteúdo.
        </p>
      </div>
    </div>
  );
};

export default Auth;