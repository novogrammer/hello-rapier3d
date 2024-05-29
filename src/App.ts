

import * as THREE from 'three';
import gsap from "gsap";

import RAPIER from "@dimforge/rapier3d-compat"
import { getElementSize } from './dom_utils';
import { BREAK_WIDTH_PC, IS_DEBUG } from './constants';
import RapierPhysics from './RapierPhysics';


interface ThreeObjects{
  renderer:THREE.WebGLRenderer;
  scene:THREE.Scene;
  camera:THREE.PerspectiveCamera;
  cube:THREE.Mesh;
}

export default class App{
  aboutElement:HTMLElement;
  threeObjects?:ThreeObjects;
  rapierPhysics:RapierPhysics;
  constructor(){
    {
      const aboutElement=document.querySelector<HTMLElement>(".p-section-about");
      if(!aboutElement){
        throw new Error("aboutElement is null");
      }
      this.aboutElement=aboutElement;
    }
    this.rapierPhysics=new RapierPhysics(RAPIER,60);
    this.setupThree();
    this.setupGsap();
    this.setupEvents();
  }
  setupThree():void{

    const {width,height}=getElementSize(this.aboutElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    this.aboutElement.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    let cube:THREE.Mesh;
    {
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      cube = new THREE.Mesh(geometry, material);
      cube.userData.physics = { mass: 1 };
      scene.add(cube);
    }

    camera.position.z = 5;

    this.threeObjects={
      renderer,
      scene,
      camera,
      cube,
    };

  }
  setupGsap():void{
    const mm = gsap.matchMedia();
    mm.add({
      isSp: `(max-width: ${BREAK_WIDTH_PC - 1}px)`,
      isPc: `(min-width: ${BREAK_WIDTH_PC}px)`,
    }, (context) => {
      if (!context.conditions) {
        throw new Error("context.conditions is null");
      }
      const { isSp, isPc } = context.conditions;
      if (IS_DEBUG) {
        console.log(`isSp: ${isSp}`);
        console.log(`isPc: ${isPc}`);
      }

      if(!this.threeObjects){
        throw new Error("threeObjects is null");
      }

      const {scene}=this.threeObjects;

      this.rapierPhysics.resetWorld();
      this.rapierPhysics.addScene(scene);

    });

  }

  setupEvents():void{

    window.addEventListener("resize",()=>{
      this.onResize();
    })
    this.onResize();

    const that=this;
    function animate() {
      requestAnimationFrame(animate);
      that.onTick();
    }
    animate();

  }
  onResize():void{
    if (!this.threeObjects) {
      throw new Error("threeObjects is null");
    }
    const { renderer, camera } = this.threeObjects;

    const {
      width,
      height,
    } = getElementSize(this.aboutElement);

    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

  }

  onTick():void{

    if(!this.threeObjects){
      throw new Error("threeObjects is null");
    }
    const {renderer,scene,camera}=this.threeObjects;

    renderer.render(scene, camera);

  }

  static async initAsync():Promise<void>{
    await RAPIER.init();
  }
}