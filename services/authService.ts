import { User } from "../types";

const USERS_KEY = 'realself_users_db_v1';
const CURRENT_USER_KEY = 'realself_session_v1';

export const authService = {
  // Retorna todos os usuários cadastrados (simulando banco de dados)
  getUsers: (): User[] => {
    try {
      const users = localStorage.getItem(USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (e) {
      return [];
    }
  },

  // Salva a lista de usuários
  saveUsers: (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // Cadastro de novo usuário
  register: (name: string, email: string, password: string): User => {
    const users = authService.getUsers();
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Este email já está cadastrado.');
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password, // Em produção real, nunca salve senhas em texto puro!
      apiKey: '' // Começa sem chave
    };

    users.push(newUser);
    authService.saveUsers(users);
    
    // Loga automaticamente após cadastro
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  // Login
  login: (email: string, password: string): User => {
    const users = authService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!user) {
      throw new Error('Email ou senha incorretos.');
    }
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  // Recuperação de Senha (Esqueci a senha)
  resetPassword: (email: string, newPassword: string) => {
    const users = authService.getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
      throw new Error('Email não encontrado no sistema.');
    }

    // Atualiza a senha
    users[userIndex].password = newPassword;
    authService.saveUsers(users);
  },

  // Atualizar API Key do usuário logado
  updateApiKey: (email: string, apiKey: string) => {
    const users = authService.getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex !== -1) {
      users[userIndex].apiKey = apiKey;
      authService.saveUsers(users);
      
      // Atualiza a sessão atual se for o mesmo usuário
      const currentUserStr = localStorage.getItem(CURRENT_USER_KEY);
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.email === email) {
          currentUser.apiKey = apiKey;
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        }
      }
    }
  },

  // Verifica se tem alguém logado ao abrir o app
  getCurrentUser: (): User | null => {
    try {
      const user = localStorage.getItem(CURRENT_USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  // Sair
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};