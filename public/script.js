const menuBtn = document.getElementById('menu-btn');
    const navLinks = document.getElementById('nav-links');
    let menuOpen = false;

    menuBtn.addEventListener('click', () => {
      if (!menuOpen) {
        navLinks.classList.add('nav-active');
        menuBtn.classList.add('open');
        menuOpen = true;
      } else {
        navLinks.classList.remove('nav-active');
        menuBtn.classList.remove('open');
        menuOpen = false;
      }
    });