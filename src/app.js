import { initializeDB, saveNote, getAllNotes, deleteNote, upsertNote } from './modules/storage/services/db.js';

let currentEditingNoteId = null; // 全局变量，存储当前编辑的笔记 ID

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
            // 格式化时间为24小时制精确到秒
            const formattedDate = new Date(note.lastModified).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false // 使用24小时制
            });
            noteCard.innerHTML = `
                <h3>${note.title || '无标题'}</h3>
                <p>${note.content.substring(0, 100) || '无内容'}...</p>
                <span class="note-date">${formattedDate}</span>
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

        // 保存当前编辑的笔记 ID
        currentEditingNoteId = note.id;

        const deleteButton = document.getElementById('delete-note');
        deleteButton.style.display = 'block';

        deleteButton.onclick = () => {
            toggleInlineConfirmation(noteId, deleteButton, noteInput);
        };

        console.log(`正在编辑笔记: ${note.title}`);
    }).catch((error) => {
        console.error('加载笔记失败:', error);
    });
}

function toggleInlineConfirmation(noteId, deleteButton, noteInput) {
    // 如果确认框已存在，则移除
    const existingConfirmation = document.querySelector('.inline-confirmation');
    if (existingConfirmation) {
        existingConfirmation.remove();
        return;
    }

    // 创建确认框
    const confirmationBox = document.createElement('div');
    confirmationBox.className = 'inline-confirmation';
    confirmationBox.innerHTML = `
        <p>确认删除？</p>
        <button id="confirm-delete" class="confirm-btn">确认</button>
        <button id="cancel-delete" class="cancel-btn">取消</button>
    `;

    // 将确认框插入到删除按钮后面
    deleteButton.parentNode.insertBefore(confirmationBox, deleteButton.nextSibling);

    // 绑定事件
    document.getElementById('confirm-delete').onclick = async () => {
        try {
            await deleteNote(noteId);
            noteInput.value = '';
            deleteButton.style.display = 'none';
            confirmationBox.remove();
            showFeedbackMessage('笔记已删除！');
            renderNotes();
        } catch (error) {
            console.error('删除笔记失败:', error);
            showFeedbackMessage('删除笔记失败，请稍后重试。', true);
            confirmationBox.remove();
        }
    };

    document.getElementById('cancel-delete').onclick = () => {
        confirmationBox.remove();
    };
}

function initializeEditor() {
    const noteInput = document.getElementById('note-input');
    const saveButton = document.getElementById('save-note');
    const deleteButton = document.createElement('button');
    deleteButton.id = 'delete-note';
    deleteButton.textContent = '删除笔记';
    deleteButton.style.display = 'none';
    saveButton.parentNode.insertBefore(deleteButton, saveButton.nextSibling);

    const newNoteButton = document.getElementById('new-note');
    newNoteButton.addEventListener('click', () => {
        noteInput.value = '';
        deleteButton.style.display = 'none';

        // 清除当前编辑的笔记 ID
        currentEditingNoteId = null;

        showFeedbackMessage('已创建新笔记！');
    });

    saveButton.addEventListener('click', async () => {
        const noteContent = noteInput.value.trim();
        if (!noteContent) {
            showFeedbackMessage('请输入笔记内容！', true);
            return;
        }

        try {
            const noteData = {
                id: currentEditingNoteId || undefined, // 如果有 ID，则传递；否则视为新建
                title: noteContent.substring(0, 20) || noteContent,
                content: noteContent,
                created: currentEditingNoteId ? undefined : Date.now(), // 仅新建时设置创建时间
                lastModified: Date.now(),
                isFavorite: false,
                deleted: false,
            };

            await upsertNote(noteData); // 调用统一的保存或更新方法
            noteInput.value = '';
            deleteButton.style.display = 'none';
            currentEditingNoteId = null; // 重置编辑状态
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

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    document.getElementById('new-note').click();
});
