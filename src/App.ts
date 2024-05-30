

import * as THREE from 'three';
import gsap from "gsap";

import RAPIER from "@dimforge/rapier3d-compat"
import { getElementSize } from './dom_utils';
import { BREAK_WIDTH_PC, IS_DEBUG } from './constants';
import RapierPhysics from './RapierPhysics';


const WALL_THICKNESS=1;
const WALL_LENGTH=5;

interface ThreeObjects{
  renderer:THREE.WebGLRenderer;
  scene:THREE.Scene;
  camera:THREE.PerspectiveCamera;
  cube:THREE.Mesh;
  sphere:THREE.Mesh;
  wallTop:THREE.Mesh;
  wallBottom:THREE.Mesh;
  wallFront:THREE.Mesh;
  wallBack:THREE.Mesh;
  wallLeft:THREE.Mesh;
  wallRight:THREE.Mesh;
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
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    this.aboutElement.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff,0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(2, 5, 10).normalize();
    scene.add(directionalLight);

    let cube:THREE.Mesh;
    {
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        metalness:0,
        roughness:0.3,
      });
      cube = new THREE.Mesh(geometry, material);
      cube.userData.physics = { mass: 1 };
      scene.add(cube);
    }
    let sphere:THREE.Mesh;
    {
      const geometry = new THREE.IcosahedronGeometry(0.5,3);
      const material = new THREE.MeshStandardMaterial({
        color: 0x0000ff,
        metalness:0,
        roughness:0.3,
      });
      sphere = new THREE.Mesh(geometry, material);
      sphere.userData.physics = { mass: 1 };
      scene.add(sphere);
    }
    let wallTop:THREE.Mesh;
    {
      const geometry = new THREE.BoxGeometry(WALL_LENGTH,WALL_THICKNESS,WALL_LENGTH);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness:0,
        roughness:1,
      });
      wallTop = new THREE.Mesh(geometry, material);
      wallTop.userData.physics = { mass: 0 };
      scene.add(wallTop);
    }
    let wallBottom:THREE.Mesh;
    {
      const geometry = new THREE.BoxGeometry(WALL_LENGTH,WALL_THICKNESS,WALL_LENGTH);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness:0,
        roughness:1,
      });
      wallBottom = new THREE.Mesh(geometry, material);
      wallBottom.userData.physics = { mass: 0 };
      scene.add(wallBottom);
    }
    let wallFront:THREE.Mesh;
    {
      const geometry = new THREE.BoxGeometry(WALL_LENGTH,WALL_LENGTH,WALL_THICKNESS);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness:0,
        roughness:1,
      });
      wallFront = new THREE.Mesh(geometry, material);
      wallFront.visible=false;
      wallFront.userData.physics = { mass: 0 };
      scene.add(wallFront);
    }
    let wallBack:THREE.Mesh;
    {
      const geometry = new THREE.BoxGeometry(WALL_LENGTH,WALL_LENGTH,WALL_THICKNESS);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness:0,
        roughness:1,
      });
      wallBack = new THREE.Mesh(geometry, material);
      wallBack.userData.physics = { mass: 0 };
      scene.add(wallBack);
    }
    let wallLeft:THREE.Mesh;
    {
      const geometry = new THREE.BoxGeometry(WALL_THICKNESS,WALL_LENGTH,WALL_LENGTH);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness:0,
        roughness:1,
      });
      wallLeft = new THREE.Mesh(geometry, material);
      wallLeft.userData.physics = { mass: 0 };
      scene.add(wallLeft);
    }
    let wallRight:THREE.Mesh;
    {
      const geometry = new THREE.BoxGeometry(WALL_THICKNESS,WALL_LENGTH,WALL_LENGTH);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness:0,
        roughness:1,
      });
      wallRight = new THREE.Mesh(geometry, material);
      wallRight.userData.physics = { mass: 0 };
      scene.add(wallRight);
    }


    this.threeObjects={
      renderer,
      scene,
      camera,
      cube,
      sphere,
      wallTop,
      wallBottom,
      wallFront,
      wallBack,
      wallLeft,
      wallRight,
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

      const {
        scene,
        camera,
        cube,
        sphere,
        wallTop,
        wallBottom,
        wallFront,
        wallBack,
        wallLeft,
        wallRight,
      }=this.threeObjects;

      this.rapierPhysics.resetWorld();
      camera.position.set(0,2,5);
      sphere.position.set(0.1,1,0.1);
      cube.position.set(0,3,0);
      wallTop.position.set(0,WALL_LENGTH+WALL_THICKNESS*0.5,0);
      wallBottom.position.set(0,WALL_THICKNESS*-0.5,0);
      wallFront.position.set(0,WALL_LENGTH*0.5,WALL_LENGTH*0.5+WALL_THICKNESS*0.5);
      wallBack.position.set(0,WALL_LENGTH*0.5,WALL_LENGTH*-0.5+WALL_THICKNESS*-0.5);
      wallLeft.position.set(WALL_LENGTH*-0.5+WALL_THICKNESS*-0.5,WALL_LENGTH*0.5,0);
      wallRight.position.set(WALL_LENGTH*0.5+WALL_THICKNESS*0.5,WALL_LENGTH*0.5,0);

      if(isSp){

      }
      if(isPc){
        
      }

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