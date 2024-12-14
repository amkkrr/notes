// 设置全局事件监听器
export const setupEventListeners = () => {
    // 切换主题事件
    const themeSelect = document.getElementById('theme-select');
    themeSelect.addEventListener('change', (event) => {
        const selectedTheme = event.target.value;
        document.documentElement.setAttribute('data-theme', selectedTheme);
        console.log('主题切换为:', selectedTheme);
    });

    // 添加更多事件监听
    console.log('全局事件监听器已设置');
};
