

import * as THREE from 'three';

import RAPIER from "@dimforge/rapier3d-compat"

export default class App{
  promiseSetup:Promise<void>
  constructor(){
    this.promiseSetup=this.setupAsync();
    this.promiseSetup.catch((error)=>{
      console.error(error);
    });
  }
  async setupAsync():Promise<void>{
    // シーン、カメラ、レンダラーの設定
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // ライトの追加
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    // オブジェクトの追加
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    // const RAPIER = await import("@dimforge/rapier3d");
    await RAPIER.init();

    // 物理ワールドの作成
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    const world = new RAPIER.World(gravity);

    // 物理オブジェクトの作成
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 5, 0);
    const rigidBody = world.createRigidBody(rigidBodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
    world.createCollider(colliderDesc, rigidBody);

    // アニメーションループ
    function animate() {
      requestAnimationFrame(animate);

      // 物理シミュレーションのステップ
      world.step();

      // オブジェクトの位置と回転を更新
      const position = rigidBody.translation();
      const rotation = rigidBody.rotation();
      cube.position.set(position.x, position.y, position.z);
      cube.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);

      renderer.render(scene, camera);
    }
    animate();

  }
}