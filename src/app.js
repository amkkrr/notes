import { initializeDB, saveNote } from './modules/storage/services/db.js';
import { renderNotes } from './pages/home.js';

function initializeEditor() {
    const noteInput = document.getElementById('note-input');
    const saveButton = document.getElementById('save-note');
    const saveStatus = document.createElement('p');
    saveStatus.id = 'save-status';
    saveStatus.style.color = 'green';
    saveStatus.style.marginTop = '10px';
    saveButton.parentNode.insertBefore(saveStatus, saveButton.nextSibling);

saveButton.addEventListener('click', async () => {
    console.log('保存按钮点击事件触发'); // 调试日志
    const noteContent = noteInput.value.trim();
    if (!noteContent) {
        alert('请输入笔记内容！');
        return;
    }

    try {
        console.log('开始保存笔记'); // 调试日志
        const newNote = {
            title: noteContent.substring(0, 20) || noteContent,
            content: noteContent,
            created: Date.now(),
            lastModified: Date.now(),
            isFavorite: false,
            deleted: false,
        };
        const noteId = await saveNote(newNote);
        console.log('笔记保存成功，ID:', noteId); // 调试日志
        noteInput.value = '';
        saveStatus.textContent = '笔记已保存！';
        setTimeout(() => saveStatus.textContent = '', 3000);

        const noteListContainer = document.querySelector('.note-list');
        const newNoteCard = document.createElement('div');
        newNoteCard.className = 'note-card';
        newNoteCard.innerHTML = `
            <h3>${newNote.title || '无标题'}</h3>
            <p>${newNote.content.substring(0, 100) || '无内容'}...</p>
            <span class="note-date">${new Date(newNote.lastModified).toLocaleDateString()}</span>
        `;
        noteListContainer.prepend(newNoteCard);
    } catch (error) {
        console.error('保存笔记失败:', error);
        saveStatus.style.color = 'red';
        saveStatus.textContent = '保存笔记失败，请稍后重试。';
        setTimeout(() => saveStatus.textContent = '', 5000);
    }
});

}

function initializeSettingsDrawer() {
    const settingsButton = document.getElementById('settings-btn');
    const settingsDrawer = document.getElementById('settings-drawer');

    settingsButton.addEventListener('click', () => {
        settingsDrawer.classList.toggle('visible');
    });
}

async function initializeApp() {
    await initializeDB();
    initializeEditor();
    initializeSettingsDrawer();
    await renderNotes();
}

document.addEventListener('DOMContentLoaded', initializeApp);
