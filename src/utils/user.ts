import { promises as fsPromises } from 'fs';
import path from 'path';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: string;
}

const usersFilePath = path.join(process.cwd(), 'data/json/users.json');

// Tüm kullanıcıları getir
export async function getUsers(): Promise<User[]> {
  try {
    const data = await fsPromises.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

// Kullanıcı adına göre kullanıcıyı getir
export async function getUserByUsername(username: string): Promise<User | null> {
  const users = await getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  return user || null;
}

// ID'ye göre kullanıcıyı getir
export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  const user = users.find(u => u.id === id);
  return user || null;
}

// Yeni kullanıcı ekle
export async function addUser(user: User): Promise<boolean> {
  try {
    const users = await getUsers();
    
    // Kullanıcı adı benzersiz olmalı
    if (users.some(u => u.username.toLowerCase() === user.username.toLowerCase())) {
      return false;
    }
    
    const newUsers = [...users, user];
    await fsPromises.writeFile(usersFilePath, JSON.stringify(newUsers, null, 2));
    return true;
  } catch (error) {
    console.error('Error adding user:', error);
    return false;
  }
}

// Kullanıcıyı güncelle
export async function updateUser(id: string, updatedFields: Partial<User>): Promise<boolean> {
  try {
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return false;
    }
    
    // Eğer username güncellenmişse benzersiz olduğundan emin ol
    if (updatedFields.username && 
        updatedFields.username !== users[userIndex].username && 
        users.some(u => u.username.toLowerCase() === updatedFields.username!.toLowerCase())) {
      return false;
    }
    
    users[userIndex] = { ...users[userIndex], ...updatedFields };
    await fsPromises.writeFile(usersFilePath, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
}

// Kullanıcıyı sil
export async function deleteUser(id: string): Promise<boolean> {
  try {
    const users = await getUsers();
    const filteredUsers = users.filter(u => u.id !== id);
    
    if (filteredUsers.length === users.length) {
      return false; // Kullanıcı bulunamadı
    }
    
    await fsPromises.writeFile(usersFilePath, JSON.stringify(filteredUsers, null, 2));
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
} 