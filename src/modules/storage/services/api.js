// api.js - 管理所有后端交互逻辑

// 使用vite提供服务端api
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchNotes = async () => {
    const response = await fetch(`${BASE_URL}/notes`);
    if (!response.ok) throw new Error('获取笔记失败');
    return await response.json();
};

export const fetchNoteById = async (id) => {
    const response = await fetch(`${BASE_URL}/notes/${id}`);
    if (!response.ok) throw new Error('获取单条笔记失败');
    return await response.json();
};

export const createNote = async (note) => {
    const response = await fetch(`${BASE_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
    });
    if (!response.ok) throw new Error('创建笔记失败');
    return await response.json();
};

export const updateNote = async (id, updates) => {
    const response = await fetch(`${BASE_URL}/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('更新笔记失败');
    return await response.json();
};

export const deleteNote = async (id) => {
    const response = await fetch(`${BASE_URL}/notes/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('删除笔记失败');
};
