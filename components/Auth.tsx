import React, { useState } from 'react';
import { Sparkles, ArrowRight, User as UserIcon, Mail, Lock, KeyRound, ArrowLeft } from 'lucide-react';
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

    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    try {
      if (view === 'LOGIN') {
        const user = authService.login(formData.email, formData.password);
        onLogin(user);
      } else if (view === 'REGISTER') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        if (formData.password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }
        const user = authService.register(formData.name, formData.email, formData.password);
        setSuccess('Conta criada com sucesso! Fazendo login...');
        setTimeout(() => onLogin(user), 1000);
      } else if (view === 'FORGOT_PASS') {
        if (formData.password.length < 6) {
            throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
        }
        authService.resetPassword(formData.email, formData.password);
        setSuccess('Senha redefinida com sucesso! Volte para o login.');
        setTimeout(() => setView('LOGIN'), 1500);
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
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 mb-6">
             <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">RealSelf AI</h1>
          <p className="text-slate-400">Suas fotos, reinventadas com IA.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">
            {view === 'LOGIN' && 'Bem-vindo de volta'}
            {view === 'REGISTER' && 'Criar nova conta'}
            {view === 'FORGOT_PASS' && 'Redefinir Senha'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {view === 'REGISTER' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 ml-1">Nome</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 ml-1">
                {view === 'FORGOT_PASS' ? 'Nova Senha' : 'Senha'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="******"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {view === 'REGISTER' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 ml-1">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="******"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm text-center">
                {error}
              </div>
            )}
             {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-200 text-sm text-center">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold tracking-wide transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? 'Processando...' : (
                <>
                  {view === 'LOGIN' && 'Entrar'}
                  {view === 'REGISTER' && 'Cadastrar'}
                  {view === 'FORGOT_PASS' && 'Redefinir'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-3">
            {view === 'LOGIN' && (
              <>
                <button onClick={() => setView('FORGOT_PASS')} className="text-sm text-slate-400 hover:text-white transition-colors">
                  Esqueci minha senha
                </button>
                <div className="text-sm text-slate-500">
                  Não tem uma conta?{' '}
                  <button onClick={() => setView('REGISTER')} className="text-indigo-400 hover:text-indigo-300 font-medium">
                    Criar conta
                  </button>
                </div>
              </>
            )}

            {view === 'REGISTER' && (
              <div className="text-sm text-slate-500">
                Já tem uma conta?{' '}
                <button onClick={() => setView('LOGIN')} className="text-indigo-400 hover:text-indigo-300 font-medium">
                  Fazer login
                </button>
              </div>
            )}

            {view === 'FORGOT_PASS' && (
              <button onClick={() => setView('LOGIN')} className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-full">
                <ArrowLeft className="w-4 h-4" /> Voltar para o login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
