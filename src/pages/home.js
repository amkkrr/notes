import { getAllNotes } from '../modules/storage/services/db.js';

export const renderNotes = async () => {
    const noteListContainer = document.querySelector('.note-list');
    noteListContainer.innerHTML = ''; // 清空现有内容

    try {
        const notes = await getAllNotes();
        if (notes.length === 0) {
            noteListContainer.innerHTML = '<p>没有可显示的笔记。</p>';
            return;
        }

        notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            noteCard.innerHTML = `
                <h3>${note.title || '无标题'}</h3>
                <p>${note.content.substring(0, 100) || '无内容'}...</p>
                <span class="note-date">${new Date(note.lastModified).toLocaleDateString()}</span>
            `;
            noteListContainer.appendChild(noteCard);
        });
    } catch (error) {
        console.error('渲染笔记列表失败:', error);
    }
};
