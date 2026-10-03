(() => {
  const button = document.getElementById('update-button');
  const status = document.getElementById('update-status');
  const say = text => { status.textContent = text; };
  let registration;
  let applying = false;
  let hadController = !!navigator.serviceWorker?.controller;
  const timeout = (promise, ms = 45000) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
  const message = (worker, type) => timeout(new Promise((resolve, reject) => {
    if (!worker) return reject(new Error('no worker'));
    const channel = new MessageChannel();
    channel.port1.onmessage = event => {
      channel.port1.close();
      event.data?.ok ? resolve(event.data) : reject(new Error('cache not ready'));
    };
    worker.postMessage({type}, [channel.port2]);
  }), 8000);
  const installed = worker => timeout(new Promise((resolve, reject) => {
    const check = () => {
      if (worker.state === 'installed' || worker.state === 'activated') { worker.removeEventListener('statechange', check); resolve(); }
      if (worker.state === 'redundant') { worker.removeEventListener('statechange', check); reject(new Error('install failed')); }
    };
    worker.addEventListener('statechange', check);
    check();
  }));
  if (!('serviceWorker' in navigator) || !isSecureContext || location.protocol === 'file:') {
    button.disabled = true;
    button.title = '更新・オフライン保存はHTTPSで開いたappで利用できます';
    return;
  }
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (applying || hadController) location.reload();
    hadController = true;
  });
  const register = () => registration ||= navigator.serviceWorker.register('sw.js?v=2026', {updateViaCache:'none'}).catch(error => {
    registration = null;
    throw error;
  });
  window.addEventListener('load', () => {
    register().then(async reg => {
      if (!navigator.serviceWorker.controller) {
        if (reg.installing) await installed(reg.installing);
        await timeout(navigator.serviceWorker.ready);
        await message(reg.active, 'CHECK_READY');
        say('オフライン利用の準備ができました');
        setTimeout(() => { if (!applying && !button.disabled) say(''); }, 5000);
      }
    }).catch(() => say('オフライン保存を完了できませんでした。通信できるときに「更新して再起動」を押してください'));
  });
  button.addEventListener('click', async () => {
    button.disabled = true;
    say('更新を確認しています…');
    try {
      const reg = await timeout(register());
      await timeout(reg.update());
      if (reg.installing) {
        say('新版を取得しています…');
        await installed(reg.installing);
      }
      if (reg.waiting) {
        await message(reg.waiting, 'CHECK_READY');
        say('取得完了。新版に切り替えています…');
        applying = true;
        await message(reg.waiting, 'APPLY_UPDATE');
        // controllerchange normally reloads. Check the controller if its event was delayed.
        await new Promise(resolve => setTimeout(resolve, 5000));
        const info = await message(navigator.serviceWorker.controller, 'CHECK_READY');
        if (info.version !== APP_VERSION) location.reload();
        else throw new Error('activation pending');
      } else {
        await message(reg.active, 'CHECK_READY');
        say('最新版です。再起動します…');
        location.reload();
      }
    } catch (error) {
      applying = false;
      say('更新できませんでした。現在のバージョンを使用します');
      button.disabled = false;
    }
  });
})();
