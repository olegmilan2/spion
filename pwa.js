(() => {
  const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  const isSecure = window.location.protocol === 'https:' || isLocalhost;

  if ('serviceWorker' in navigator && isSecure) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  let deferredInstallPrompt = null;
  const installBtn = document.createElement('button');
  installBtn.type = 'button';
  installBtn.className = 'install-app-btn hidden';
  installBtn.textContent = 'Установить приложение';
  document.body.appendChild(installBtn);

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installBtn.classList.remove('hidden');
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice.catch(() => {});
    deferredInstallPrompt = null;
    installBtn.classList.add('hidden');
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    installBtn.classList.add('hidden');
  });
})();
