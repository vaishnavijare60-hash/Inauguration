/**
 * Auto-Fullscreen Helper for Digital Smartboards / Teaching Displays
 */
export function initAutoFullscreen() {
  function requestFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();

    document.removeEventListener('click', requestFullscreen);
    document.removeEventListener('touchstart', requestFullscreen);
  }

  document.addEventListener('click', requestFullscreen, { once: true });
  document.addEventListener('touchstart', requestFullscreen, { once: true });
}
