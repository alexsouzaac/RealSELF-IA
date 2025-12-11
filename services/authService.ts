import { User } from "../types";

const USERS_KEY = 'realself_users';
const CURRENT_USER_KEY = 'realself_current_user';

export const authService = {
  getUsers: (): User[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },

  saveUsers: (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  register: (name: string, email: string, password: string): User => {
    const users = authService.getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('Este email já está cadastrado.');
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password, // In a real app, never store plain text passwords
      apiKey: ''
    };

    users.push(newUser);
    authService.saveUsers(users);
    return newUser;
  },

  login: (email: string, password: string): User => {
    const users = authService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Email ou senha incorretos.');
    }
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  resetPassword: (email: string, newPassword: string) => {
    const users = authService.getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      throw new Error('Email não encontrado.');
    }

    users[userIndex].password = newPassword;
    authService.saveUsers(users);
  },

  updateApiKey: (email: string, apiKey: string) => {
    const users = authService.getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex !== -1) {
      users[userIndex].apiKey = apiKey;
      authService.saveUsers(users);
      
      // Update current session if it's the same user
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.email === email) {
        currentUser.apiKey = apiKey;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      }
    }
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};
