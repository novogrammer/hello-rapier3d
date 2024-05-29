import App from './App';
import './style.scss'



document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <section class="p-section-hero">
  <h1 class="p-section-hero__title">Hello RAPIER3D!</h1>
  <p class="p-section-hero__text">↓</p>
  </section>
  <section class="p-section-about">
  </section>
  <section class="p-section-footer">
  </section>
  <div>
    Hello
  </div>
`;

(window as any).app=new App();
