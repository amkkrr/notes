// db.js

import Dexie from './dexie.mjs';

// 初始化数据库
const db = new Dexie('NotesDB');

// 定义表结构
db.version(1).stores({
    notes: '++id, title, content, created, lastModified, isFavorite, deleted' // 笔记表
});

// 数据库初始化函数
export const initializeDB = async () => {
    try {
        await db.open();
        console.log('数据库已成功初始化');
    } catch (error) {
        console.error('数据库初始化失败:', error);
    }
    return db;
};

// 保存笔记
export const saveNote = async (note) => {
    try {
        const id = await db.notes.add(note);
        console.log(`笔记已保存，ID: ${id}`);
        return id;
    } catch (error) {
        console.error('保存笔记失败:', error);
        throw error;
    }
};

// 获取所有笔记
export const getAllNotes = async () => {
    try {
        const notes = await db.notes.filter(note => note.deleted !== true).toArray();
        return notes;
    } catch (error) {
        console.error('获取笔记失败:', error);
        throw error;
    }
};


// 删除笔记 (软删除)
export const deleteNote = async (id) => {
    try {
        await db.notes.update(id, { deleted: true });
        console.log(`笔记已标记为删除，ID: ${id}`);
    } catch (error) {
        console.error('删除笔记失败:', error);
        throw error;
    }
};

// 更新笔记
export const updateNote = async (id, updates) => {
    try {
        await db.notes.update(id, updates);
        console.log(`笔记已更新，ID: ${id}`);
    } catch (error) {
        console.error('更新笔记失败:', error);
        throw error;
    }
};
