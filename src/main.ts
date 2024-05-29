import App from './App';
import './style.css'



document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    Hello
  </div>
`;

(window as any).app=new App();
