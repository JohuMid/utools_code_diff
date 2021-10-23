const electron = require('electron')

// 获取用户选中的文字
window.getSelectText = () => {
  // eslint-disable-next-line no-undef
  let ctlKey = utools.isMacOs() ? 'command' : 'control'
  // eslint-disable-next-line no-undef
  utools.simulateKeyboardTap('c', ctlKey);
  return electron.clipboard.readText()
}
