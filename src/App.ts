

import * as THREE from 'three';
import gsap from "gsap";

import RAPIER from "@dimforge/rapier3d-compat"
import { getElementSize } from './dom_utils';
import { BREAK_WIDTH_PC, IS_DEBUG } from './constants';
import RapierPhysics from './RapierPhysics';
import { calcCameraZ } from './three_utils';


const WALL_THICKNESS=1;
const WALL_LENGTH=5;
const WALL_WIDTH=10;

interface ThreeObjects{
  renderer:THREE.WebGLRenderer;
  scene:THREE.Scene;
  camera:THREE.PerspectiveCamera;
  meshList:THREE.Mesh[];
  wallTop:THREE.Mesh;
  wallBottom:THREE.Mesh;
  wallFront:THREE.Mesh;
  wallBack:THREE.Mesh;
  wallLeft:THREE.Mesh;
  wallRight:THREE.Mesh;
}

function getTime(){
  return performance.now()*0.001;
}
function getScrollPositionY(){
  return window.scrollY;
}

function createDynamicCube():THREE.Mesh{
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    metalness:0,
    roughness:0.3,
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.userData.physics = { mass: 1 };
  return cube;
}
function createDynamicSphere():THREE.Mesh{
  const geometry = new THREE.IcosahedronGeometry(0.5,3);
  const material = new THREE.MeshStandardMaterial({
    color: 0x0000ff,
    metalness:0,
    roughness:0.3,
  });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.userData.physics = { mass: 1 };
  return sphere;
}


export default class App{
  aboutElement:HTMLElement;
  threeObjects?:ThreeObjects;
  rapierPhysics:RapierPhysics;

  previousTime:number;
  previousScrollPositionY:number;
  previousScrollVelocityY:number;
  constructor(){
    {
      const aboutElement=document.querySelector<HTMLElement>(".p-section-about");
      if(!aboutElement){
        throw new Error("aboutElement is null");
      }
      this.aboutElement=aboutElement;
    }
    this.rapierPhysics=new RapierPhysics(RAPIER,60);
    this.previousTime=getTime();
    this.previousScrollPositionY=0;
    this.previousScrollVelocityY=0;
    this.setupThree();
    this.setupGsap();
    this.setupEvents();
  }
  setupThree():void{

    const {width,height}=getElementSize(this.aboutElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    this.aboutElement.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff,0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(2, 5, 10).normalize();
    scene.add(directionalLight);

    const meshList:THREE.Mesh[]=[];
    for(let i=0;i<3*3*3;i++){
      if(i%2==0){
        const mesh=createDynamicCube();
        meshList.push(mesh);
        scene.add(mesh);
      }else{
        const mesh=createDynamicSphere();
        meshList.push(mesh);
        scene.add(mesh);
      }

  
  
    }

    let wallTop:THREE.Mesh;
    {
      const geometry = new THREE.BoxGeometry(WALL_WIDTH,WALL_THICKNESS,WALL_LENGTH);
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
      const geometry = new THREE.BoxGeometry(WALL_WIDTH,WALL_THICKNESS,WALL_LENGTH);
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
      const geometry = new THREE.BoxGeometry(WALL_WIDTH,WALL_LENGTH,WALL_THICKNESS);
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
      const geometry = new THREE.BoxGeometry(WALL_WIDTH,WALL_LENGTH,WALL_THICKNESS);
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
      meshList,
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
        meshList,
        wallTop,
        wallBottom,
        wallFront,
        wallBack,
        wallLeft,
        wallRight,
      }=this.threeObjects;

      this.rapierPhysics.resetWorld();

      this.previousTime=getTime();
      this.previousScrollPositionY=getScrollPositionY();
      this.previousScrollVelocityY=0;
  
      // length^(1/3)
      const l=Math.ceil(Math.pow(meshList.length,1/3));
      for(let iz=0;iz<l;iz++){
        const z=(iz-l/2)*1;
        for(let iy=0;iy<l;iy++){
          const y=(iy-l/2)*1;
          for(let ix=0;ix<l;ix++){
            const x=(ix-l/2)*1;
            const i=iz*l*l+iy*l+ix;
            if(i<meshList.length){
              const mesh=meshList[i];
              mesh.position.set(x,y+WALL_LENGTH*0.5,z);
            }
          }
        }
      }
      wallTop.position.set(0,WALL_LENGTH+WALL_THICKNESS*0.5,0);
      wallBottom.position.set(0,WALL_THICKNESS*-0.5,0);
      wallFront.position.set(0,WALL_LENGTH*0.5,WALL_LENGTH*0.5+WALL_THICKNESS*0.5);
      wallBack.position.set(0,WALL_LENGTH*0.5,WALL_LENGTH*-0.5+WALL_THICKNESS*-0.5);

      const cameraZ=calcCameraZ(WALL_LENGTH,camera.fov)+WALL_LENGTH*0.5;
      const wallWidth=WALL_LENGTH*camera.aspect;

      camera.position.set(0,2.5,cameraZ);
      wallLeft.position.set(wallWidth*-0.5+WALL_THICKNESS*-0.5,WALL_LENGTH*0.5,0);
      wallRight.position.set(wallWidth*0.5+WALL_THICKNESS*0.5,WALL_LENGTH*0.5,0);

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

    const animate=()=> {
      requestAnimationFrame(animate);
      this.onTick();
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
    if(!this.rapierPhysics){
      throw new Error("rapierPhysics is null");
    }

    const time=getTime();
    // 0割りを回避する
    const deltaTime=Math.max(0.001,time-this.previousTime);
    // console.log(`deltaTime: ${deltaTime}`);
    if(0.1<=deltaTime){
      const scrollPositionY=getScrollPositionY();
      const scrollVelocityY=(scrollPositionY - this.previousScrollPositionY)/deltaTime;
  
      // console.log(`scrollVelocityY: ${scrollVelocityY}`);
  
      const scrollAccelerationY=(scrollVelocityY-this.previousScrollVelocityY)/deltaTime;
  
      // console.log(`scrollAccelerationY: ${scrollAccelerationY}`);
  
      const {height}=getElementSize(this.aboutElement);
      // console.log(`height: ${height}`);
      const px2m = WALL_LENGTH / height * -1;
      // console.log(`px2m: ${px2m}`);
      const scrollAccelerationYM=scrollAccelerationY*px2m;
      // console.log(`scrollAccelerationYM: ${scrollAccelerationYM}`);
  
      this.previousTime=time;
      this.previousScrollPositionY=scrollPositionY;
      this.previousScrollVelocityY=scrollVelocityY;
  
      const gravityY=scrollAccelerationYM-9.8;
      // const gravityY=scrollAccelerationYM;
  
      this.rapierPhysics.world.gravity.y=gravityY;
      this.rapierPhysics.world.bodies.forEach((body)=>{
        body.wakeUp();
      })
  
    }

    const {renderer,scene,camera}=this.threeObjects;


    renderer.render(scene, camera);

  }

  static async initAsync():Promise<void>{
    await RAPIER.init();
  }
}