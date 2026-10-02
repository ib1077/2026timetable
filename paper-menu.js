(() => {
  const picker = document.getElementById('paper-picker');
  const dialog = document.getElementById('paper-view');
  const frame = document.getElementById('paper-frame');
  const label = document.getElementById('paper-label');
  const trigger = picker.querySelector('summary');
  picker.querySelectorAll('[data-paper]').forEach(button => {
    button.addEventListener('click', () => {
      picker.open = false;
      label.textContent = button.textContent + '（試作）';
      frame.title = button.textContent;
      frame.src = button.dataset.paper;
      dialog.showModal();
      document.getElementById('paper-close').focus();
    });
  });
  document.getElementById('paper-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    frame.src = 'about:blank';
    trigger.focus({preventScroll:true});
  });
  document.addEventListener('click', event => {
    if (!picker.contains(event.target)) picker.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && picker.open) {
      picker.open = false;
      trigger.focus();
    }
  });
})();
