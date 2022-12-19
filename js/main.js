//GLOBAL VARIABLES

const START_POSITION = 3;
const END_POSITION = -START_POSITION;
const TEXT = document.querySelector(".text");
const TIME_LIMIT = 20;
let isLookingBackward = true;
let gameState = "loading";

let DEAD_PLAYERS = 0;
let SAFE_PLAYERS = 0;

const startBtn = document.querySelector(".start-btn");

//music
const bgMusic = new Audio("./music/bg.mp3");
bgMusic.loop = true;
const winMusic = new Audio("./music/win.mp3");
const loseMusic = new Audio("./music/lose.mp3");

//Boilerplate code for initializing a new scene and camera

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Set Background color and opacity of the scene
renderer.setClearColor(0xb7c3f3, 1);
//Light source
const light = new THREE.AmbientLight(0xffffff); // soft white light
scene.add(light);

//Camera position
camera.position.z = 5;

//Resize the scene when the window is resized
window.addEventListener(
  "resize",
  () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  },
  false
);

//Render the scene
function animate() {
  renderer.render(scene, camera);
  players.map((player) => player.player.update());
  if (gameState === "over") return;
  requestAnimationFrame(animate);
}

function delay(num) {
  if (!num) {
    num = Math.floor(Math.random() * 2) + 3;
  }
  return new Promise((resolve) => setTimeout(resolve, num * 1000));
}

//Create a cube
function createCube(size, posX, rotY = 0, colour = 0xfbc851) {
  const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
  const material = new THREE.MeshBasicMaterial({ color: colour });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(posX, 0, 0);
  cube.rotation.y = rotY;
  scene.add(cube);
  return cube;
}

//Create race track
function createTrack() {
  createCube({ w: 0.2, h: 1.5, d: 1 }, START_POSITION, -0.4);
  createCube({ w: 0.2, h: 1.5, d: 1 }, END_POSITION, 0.4);
  createCube(
    { w: START_POSITION * 2 + 0.21, h: 1.5, d: 1 },
    0,
    0,
    0xe5a716
  ).position.z = -1;
}

//Load the model
const loader = new THREE.GLTFLoader();

//Create a class for the doll
class Doll {
  constructor() {
    loader.load("../model/scene.gltf", (gltf) => {
      scene.add(gltf.scene);
      gltf.scene.scale.set(0.3, 0.3, 0.3);
      gltf.scene.position.set(0, -1, 1);
      this.doll = gltf.scene;
      startBtn.innerText = "start";
      animate();
    });

    //Create a track
    createTrack();
  }

  //Method to move the doll
  async start() {
    this.lookBackward();
    await delay();
    this.lookForward();
    await delay();
    this.start();
  }

  //Method to make the doll look back
  lookBackward() {
    gsap.to(this.doll.rotation, { y: -3.15, duration: 0.15 });
    setTimeout(() => (isLookingBackward = true), 150);
  }

  //Method to make the doll look forward
  lookForward() {
    gsap.to(this.doll.rotation, { y: 0, duration: 0.45 });

    setTimeout(() => (isLookingBackward = false), 450);
  }
}

//create a class for the Player
class Player {
  constructor(name = "Player", radius = 0.25, posY = 0, colour = 0xffffff) {
    const geometry = new THREE.SphereGeometry(radius, 100, 100);
    const material = new THREE.MeshBasicMaterial({ color: colour });
    const player = new THREE.Mesh(geometry, material);
    scene.add(player);
    player.position.x = START_POSITION - 0.4;
    player.position.z = 2;
    player.position.y = posY;
    this.player = player;
    this.playerInfo = {
      positionX: START_POSITION - 0.4,
      velocity: 0,
      name,
      isDead: false,
    };
  }

  run() {
    if (this.playerInfo.isDead) return;
    this.playerInfo.velocity = 0.01;
  }

  stop() {
    gsap.to(this.playerInfo, { duration: 0.1, velocity: 0 });
  }

  check() {
    if (this.playerInfo.isDead) return;
    if (!isLookingBackward && this.playerInfo.velocity > 0) {
      TEXT.innerText = this.playerInfo.name + " lost!!!";
      this.playerInfo.isDead = true;
      this.stop();
      DEAD_PLAYERS++;
      loseMusic.play();
      if (DEAD_PLAYERS === players.length) {
        TEXT.innerText = "Everyone lost!!!";
        gameState = "over";
      }
      if (DEAD_PLAYERS + SAFE_PLAYERS === players.length) {
        gameState = "over";
      }
    }
    if (this.playerInfo.positionX < END_POSITION + 0.7) {
      TEXT.innerText = this.playerInfo.name + " is safe!!!";
      this.playerInfo.isDead = true;
      this.stop();
      SAFE_PLAYERS++;
      winMusic.play();
      if (SAFE_PLAYERS === players.length) {
        TEXT.innerText = "Everyone is safe!!!";
        gameState = "over";
      }
      if (DEAD_PLAYERS + SAFE_PLAYERS === players.length) {
        gameState = "over";
      }
    }
  }

  update() {
    this.check();
    this.playerInfo.positionX -= this.playerInfo.velocity;
    this.player.position.x = this.playerInfo.positionX;
  }
}
//   this.player = sphere;
//   this.playerInfo = {
//     positionX: START_POSITION,
//     velocity: 0,
//   };
// }

// run() {
//   this.playerInfo.velocity = 0.01;
// }

// update() {
//   this.playerInfo.positionX -= this.playerInfo.velocity;
//   this.player.position.x = this.playerInfo.positionX;
//   this.check();
// }

// stop() {
//   gsap.to(this.playerInfo, { velocity: 0, duration: 0.1 });
// }

// check() {
//   if (this.playerInfo.velocity > 0 && !isLookingBackward) {
//     gameStatee = "over";
//     TEXT.innerText = "You Lose :(";
//   }
//   if (this.playerInfo.positionX < END_POSITION + 0.4) {
//     TEXT.innerText = "You Win! ";
//     gameStatee = "over";
//   }
// }

//Create a doll
let doll = new Doll();
//create players
const player1 = new Player("Player 1", 0.25, 0.3, 0xd1ffc6);
const player2 = new Player("Player 2", 0.25, -0.3, 0xffcfd2);

const players = [
  {
    player: player1,
    key: "ArrowUp",
    name: "Player 1",
  },
  {
    player: player2,
    key: "w",
    name: "Player 2",
  },
];

window.addEventListener("keydown", (e) => {
  if (gameState !== "started") return;
  let p = players.find((player) => player.key == e.key);
  if (p) {
    p.player.run();
  }
});

window.addEventListener("keyup", (e) => {
  let p = players.find((player) => player.key == e.key);
  if (p) {
    p.player.stop();
  }
});

async function init() {
  await delay(0.5);
  TEXT.innerText = "Starting in 3";
  await delay(0.5);
  TEXT.innerText = "Starting in 2";
  await delay(0.5);
  TEXT.innerText = "Starting in 1";
  await delay(0.5);
  TEXT.innerText = "Go!!";
  bgMusic.play();
  startGame();
}

function startGame() {
  let progressBar = createCube({ w: 5, h: 0.1, d: 1 }, 0);
  gameState = "started";
  progressBar.position.y = 3.35;
  gsap.to(progressBar.scale, { x: 0, duration: TIME_LIMIT, ease: "none" });

  setTimeout(() => {
    if (gameState !== "over") {
      TEXT.innerText = "Out of time!";
      loseMusic.play();
      gameState = "over";
    }
  }, TIME_LIMIT * 1000);
  doll.start();
}

startBtn.addEventListener("click", () => {
  if (startBtn.innerText === "START") {
    init();
    document.querySelector(".modal").style.display = "none";
  }
});
