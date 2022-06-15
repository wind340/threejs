import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RectAreaLightUniformsLib } from "../node_modules/three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { RectAreaLightHelper } from "../node_modules/three/examples/jsm/helpers/RectAreaLightHelper.js";

class App {
  constructor() {
    const divContainer = document.querySelector("#webgl-container");
    this._divContainer = divContainer;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    divContainer.appendChild(renderer.domElement);
    this._renderer = renderer;

    const scene = new THREE.Scene();
    this._scene = scene;

    this._setupCamera();
    this._setupLight();
    this._setupModel();
    this._setupControls();

    window.onresize = this.resize.bind(this);
    this.resize();

    requestAnimationFrame(this.render.bind(this));
  }

  _setupControls() {
    new OrbitControls(this._camera, this._divContainer);
  }

  _setupModel() {
    //Ground
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: "#2c3e5a",
      roughness: 0.5,
      metalness: 0.5,
      side: THREE.DoubleSide,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = THREE.MathUtils.degToRad(-90);
    this._scene.add(ground);

    //가운데 들어갈 bigSphere
    const bigSphereGeometry = new THREE.SphereGeometry(1.5, 64, 64, 0, Math.PI);
    const bigSphereMaterial = new THREE.MeshStandardMaterial({
      color: "#fff",
      roughness: 0.1,
      metalness: 0.2,
    });
    const bigSphere = new THREE.Mesh(bigSphereGeometry, bigSphereMaterial);
    bigSphere.rotation.x = THREE.MathUtils.degToRad(-90);
    this._scene.add(bigSphere);

    //torus 8개 설정. 반복문 사용해서
    const torusGeometry = new THREE.TorusGeometry(0.4, 0.1, 32, 32);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: "#9b59b6",
      roughness: 0.5,
      metalness: 0.9,
    });

    for (let i = 0; i < 12; i++) {
      const torusPivot = new THREE.Object3D();
      const torus = new THREE.Mesh(torusGeometry, torusMaterial);
      torusPivot.rotation.y = THREE.MathUtils.degToRad(30 * i);
      torus.position.set(3, 0.5, 0);
      torusPivot.add(torus);
      this._scene.add(torusPivot);
    }

    //torus를 통과하는 smallSphere
    const smallSphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const smallSphereMaterial = new THREE.MeshStandardMaterial({
      color: "#e74c3c",
      roughness: 0.2,
      metalness: 0.5,
    });

    const smallSpherePivot = new THREE.Object3D();
    const smallSphere = new THREE.Mesh(
      smallSphereGeometry,
      smallSphereMaterial
    );
    smallSpherePivot.add(smallSphere);
    smallSpherePivot.name = "smallSpherePivot"; // 이름을 부여해주면 scene 객체를 통해 언제든 조회할 수 있다.
    smallSphere.position.set(3, 0.5, 0);
    this._scene.add(smallSpherePivot);

    //target tracking을 위한 정의
    const targetPivot = new THREE.Object3D();
    const target = new THREE.Object3D();
    targetPivot.add(target);
    targetPivot.name = "targetPivot";
    target.position.set(3, 0.5, 0);
    this._scene.add(targetPivot);
  }

  _setupCamera() {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    // const aspect = window.innerWidth / window.innerHeight;
    // const camera = new THREE.OrthographicCamera(
    //   -1 * aspect,
    //   1 * aspect, //xLeft , xRight
    //   1,
    //   -1, // yTop , yBottom
    //   0.1,
    //   100 //zNear, zFar
    // );

    // camera.zoom = 0.15;

    camera.position.set(7, 7, 0);
    camera.lookAt(0, 0, 0);

    this._camera = camera;
  }

  _setupLight() {
    RectAreaLightUniformsLib.init(); // 광원 초기화

    const light = new THREE.RectAreaLight(0xffffff, 10, 6, 1);

    light.position.set(0, 5, 0);
    light.rotation.x = THREE.MathUtils.degToRad(-90); // -90도 방향으로 빛을 비춤

    const helper = new RectAreaLightHelper(light);
    light.add(helper);

    this._scene.add(light);
    this._light = light;

    this._scene.add(light);
    this._light = light;
  }

  // resize() {
  //   const width = this._divContainer.clientWidth;
  //   const height = this._divContainer.clientHeight;

  //   this._camera.aspect = width / height;
  //   this._camera.updateProjectionMatrix();

  //   this._renderer.setSize(width, height);
  // }

  resize() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;
    const aspect = width / height;

    if (this._camera instanceof THREE.PerspectiveCamera) {
      this._camera.aspect = aspect;
    } else {
      this._camera.left = -1 * aspect;
      this._camera.right = 1 * aspect;
    }

    this._camera.updateProjectionMatrix();
    this._renderer.setSize(width, height);
  }

  render(time) {
    this._renderer.render(this._scene, this._camera);
    this.update(time);
    requestAnimationFrame(this.render.bind(this));
  }

  update(time) {
    time *= 0.0002; //second unit

    const smallSpherePivot = this._scene.getObjectByName("smallSpherePivot");
    if (smallSpherePivot) {
      smallSpherePivot.rotation.y = THREE.MathUtils.degToRad(time * 50);

      //smallSphere camera tracking
      const smallSphere = smallSpherePivot.children[0]; //위치값
      smallSphere.getWorldPosition(this._camera.position);

      const targetPivot = this._scene.getObjectByName("targetPivot");
      if (targetPivot) {
        targetPivot.rotation.y = THREE.MathUtils.degToRad(time * 50 + 10);

        const target = targetPivot.children[0];
        const pt = new THREE.Vector3();

        target.getWorldPosition(pt); //Pivot값을 월드포지션값(PT) 지정해줌
        this._camera.lookAt(pt);
      }

      if (this._light.target) {
        const smallSphere = smallSpherePivot.children[0];
        smallSphere.getWorldPosition(this._light.target.position);
        //smallSphere의 좌표계의 위치를 구해서 광원의 타겟 위치에 지정한다

        if (this._lightHelper) this._lightHelper.update();
      }
    }
  }
}

window.onload = function () {
  new App();
};
