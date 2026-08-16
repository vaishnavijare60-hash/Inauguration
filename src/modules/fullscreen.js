/**
 * Auto-fullscreen helper that triggers browser fullscreen on first user touch/click interaction.
 */
export function initAutoFullscreen() {
  function requestFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  }

  document.addEventListener('click', requestFullscreen, { once: true });
  document.addEventListener('touchstart', requestFullscreen, { once: true });
}
