// 注册 Service Worker
export const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker 注册成功:', registration.scope);
        } catch (error) {
            console.error('Service Worker 注册失败:', error);
        }
    } else {
        console.warn('当前浏览器不支持 Service Worker');
    }
};
