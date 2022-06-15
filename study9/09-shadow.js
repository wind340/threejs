import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class App {
  constructor() {
    const divContainer = document.querySelector("#webgl-container");
    this._divContainer = divContainer;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
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
    ground.receiveShadow = true;
    this._scene.add(ground);

    //가운데 들어갈 bigSphere
    // const bigSphereGeometry = new THREE.SphereGeometry(1.5, 64, 64, 0, Math.PI);
    const bigSphereGeometry = new THREE.TorusKnotGeometry(
      1,
      0.3,
      128,
      64,
      2,
      3
    );
    const bigSphereMaterial = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.1,
      metalness: 0.2,
    });

    const bigSphere = new THREE.Mesh(bigSphereGeometry, bigSphereMaterial);
    //bigSphere.rotation.x = THREE.MathUtils.degToRad(-90);
    bigSphere.position.y = 1.6;
    bigSphere.receiveShadow = true;
    bigSphere.castShadow = true;
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
      torus.receiveShadow = true;
      torus.castShadow = true;
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
    smallSphere.receiveShadow = true;
    smallSphere.castShadow = true;
    this._scene.add(smallSpherePivot);
  }

  _setupCamera() {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    camera.zoom = 1;

    camera.position.set(7, 7, 0);
    camera.lookAt(0, 0, 0);

    this._camera = camera;
  }

  _setupLight() {
    const auxLight = new THREE.DirectionalLight(0xffffff, 0.5); //색상, 세기
    auxLight.position.set(0, 5, 0); // 빛의 위치
    auxLight.target.position.set(0, 0, 0); // 타겟의 위치
    this._scene.add(auxLight.target);
    this._scene.add(auxLight);

    // const light = new THREE.DirectionalLight(0xffffff, 0.5); //색상, 세기
    // light.position.set(0, 5, 0); // 빛의 위치
    // light.target.position.set(0, 0, 0); // 타겟의 위치
    // this._scene.add(light.target);

    // const light = new THREE.PointLight(0xffffff, 0.7);
    // light.position.set(0, 5, 0);

    const light = new THREE.SpotLight(0xffffff, 0.7);
    light.position.set(0, 5, 0);
    light.target.position.set(0, 0, 0);
    light.angle = THREE.MathUtils.degToRad(30);
    light.penumbra = 0.2;
    this._scene.add(light.target);


    //절두체 늘려서 그림자 잘림현상 없애기
    light.shadow.camera.top = light.shadow.camera.right = 6;
    light.shadow.camera.bottom = light.shadow.camera.left = -6;

    //shadow 품질을 높이기
    light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;
    //radius가 낮을수록 선명
    light.shadow.radius = 1;

    this._scene.add(light);
    this._light = light;
    light.castShadow = true;
  }

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
    time *= 0.001; //second unit

    const smallSpherePivot = this._scene.getObjectByName("smallSpherePivot");
    if (smallSpherePivot) {
      smallSpherePivot.rotation.y = THREE.MathUtils.degToRad(time * 50);

      if (this._light.target) {
        const smallSphere = smallSpherePivot.children[0];
        smallSphere.getWorldPosition(this._light.target.position);
        //smallSphere의 좌표계의 위치를 구해서 광원의 타겟 위치에 지정한다

        if (this._lightHelper) this._lightHelper.update();
      }

      //Point Light
      if(this._light instanceof THREE.PointLight){
        const smallSphere = smallSpherePivot.children[0];
        smallSphere.getWorldPosition(this._light.position);
      }
    }
  }
}

window.onload = function () {
  new App();
};
