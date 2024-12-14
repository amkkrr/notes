import { initializeDB, saveNote, getAllNotes, deleteNote } from './modules/storage/services/db.js';

function renderNotes() {
    const noteListContainer = document.querySelector('.note-list');
    noteListContainer.innerHTML = ''; // 清空现有内容

    getAllNotes().then((notes) => {
        if (notes.length === 0) {
            noteListContainer.innerHTML = '<p>没有可显示的笔记。</p>';
            return;
        }

        notes.forEach((note) => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            noteCard.dataset.id = note.id;
            noteCard.innerHTML = `
                <h3>${note.title || '无标题'}</h3>
                <p>${note.content.substring(0, 100) || '无内容'}...</p>
                <span class="note-date">${new Date(note.lastModified).toLocaleDateString()}</span>
            `;
            noteCard.addEventListener('click', () => loadNoteForEditing(note.id));
            noteListContainer.appendChild(noteCard);
        });
    }).catch((error) => {
        console.error('获取笔记失败:', error);
        noteListContainer.innerHTML = '<p>加载笔记时出错。</p>';
    });
}

function loadNoteForEditing(noteId) {
    getAllNotes().then((notes) => {
        const note = notes.find(n => n.id === noteId);
        if (!note) {
            alert('笔记未找到');
            return;
        }

        const noteInput = document.getElementById('note-input');
        noteInput.value = note.content;

        const deleteButton = document.getElementById('delete-note');
        deleteButton.style.display = 'block';

        deleteButton.onclick = async () => {
            const noteContent = noteInput.value.trim();
            if (!noteContent) {
                showFeedbackMessage('未选择任何笔记！', true);
                return;
            }

            try {
                await deleteNote(noteId);
                noteInput.value = '';
                deleteButton.style.display = 'none';
                showFeedbackMessage('笔记已删除！');
                renderNotes();
            } catch (error) {
                console.error('删除笔记失败:', error);
                showFeedbackMessage('删除笔记失败，请稍后重试。', true);
            }
        };


        console.log(`正在编辑笔记: ${note.title}`);
    }).catch((error) => {
        console.error('加载笔记失败:', error);
    });
}

function initializeEditor() {
    const noteInput = document.getElementById('note-input');
    const saveButton = document.getElementById('save-note');
    const deleteButton = document.createElement('button');
    deleteButton.id = 'delete-note';
    deleteButton.textContent = '删除笔记';
    deleteButton.style.display = 'none';
    saveButton.parentNode.insertBefore(deleteButton, saveButton.nextSibling);

    saveButton.addEventListener('click', async () => {
        const noteContent = noteInput.value.trim();
        if (!noteContent) {
            showFeedbackMessage('请输入笔记内容！', true);
            return;
        }

        try {
            const newNote = {
                title: noteContent.substring(0, 20) || noteContent,
                content: noteContent,
                created: Date.now(),
                lastModified: Date.now(),
                isFavorite: false,
                deleted: false,
            };
            await saveNote(newNote);
            noteInput.value = '';
            deleteButton.style.display = 'none';
            showFeedbackMessage('笔记已保存！');
            renderNotes();
        } catch (error) {
            console.error('保存笔记失败:', error);
            showFeedbackMessage('保存笔记失败，请稍后重试。', true);
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

function showFeedbackMessage(message, isError = false) {
    const feedbackContainer = document.getElementById('note-feedback');
    feedbackContainer.textContent = message;
    feedbackContainer.style.color = isError ? 'red' : 'green';

    // 3秒后自动清除提示信息
    setTimeout(() => {
        feedbackContainer.textContent = '';
    }, 3000);
}

async function initializeApp() {
    await initializeDB();
    initializeEditor();
    initializeSettingsDrawer();
    renderNotes();
}

document.addEventListener('DOMContentLoaded', initializeApp);
