

import * as THREE from 'three';
import gsap from "gsap";

import RAPIER from "@dimforge/rapier3d-compat"
import { getElementSize } from './dom_utils';
import { BREAK_WIDTH_PC, IS_DEBUG } from './constants';


interface ThreeObjects{
  renderer:THREE.WebGLRenderer;
  scene:THREE.Scene;
  camera:THREE.PerspectiveCamera;
  cube:THREE.Mesh;
}
interface RapierObjects{
  world:RAPIER.World;
  rigidBody:RAPIER.RigidBody;
}

export default class App{
  aboutElement:HTMLElement;
  threeObjects?:ThreeObjects;
  rapierObjects?:RapierObjects;
  constructor(){
    {
      const aboutElement=document.querySelector<HTMLElement>(".p-section-about");
      if(!aboutElement){
        throw new Error("aboutElement is null");
      }
      this.aboutElement=aboutElement;
    }
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

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

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

      if(this.rapierObjects){
        const {world}=this.rapierObjects;
        world.free();
      }

      const gravity = { x: 0.0, y: -9.81, z: 0.0 };
      const world = new RAPIER.World(gravity);

      const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 5, 0);
      const rigidBody = world.createRigidBody(rigidBodyDesc);

      const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
      world.createCollider(colliderDesc, rigidBody);


      this.rapierObjects={
        world,
        rigidBody,
      }
    });

  }

  setupEvents():void{
    const that=this;
    function animate() {
      requestAnimationFrame(animate);
      that.onTick();
    }
    animate();

  }

  onTick():void{

    if(!this.threeObjects){
      throw new Error("threeObjects is null");
    }
    if(!this.rapierObjects){
      throw new Error("rapierObjects is null");
    }
    const {cube,renderer,scene,camera}=this.threeObjects;
    const {world,rigidBody}=this.rapierObjects;

    world.step();

    const position = rigidBody.translation();
    const rotation = rigidBody.rotation();
    cube.position.set(position.x, position.y, position.z);
    cube.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);

    renderer.render(scene, camera);

  }

  static async initAsync():Promise<void>{
    await RAPIER.init();
  }
}