let video;
let handpose;
let predictions = [];
let currentQuestion = 0;
let score = 0;
let answered = false;
let pointerX = 400,
  pointerY = 300; // 紅點初始位置
let smoothFactor = 0.3; // 平滑係數

// 新增變數
let hoverStartTime = null;
let hoveringIndex = -1;
const hoverConfirmTime = 3000; // 停留1秒確認

let questions = [
  {
    q: "1. 教育科技中，哪個工具最常用於線上會議？",
    options: ["A. Zoom", "B. Photoshop", "C. Excel"],
    answer: 0
  },
  {
    q: "2. 哪種技術可用於自適應學習？",
    options: ["A. AI人工智慧", "B. 印表機", "C. 投影機"],
    answer: 0
  },
  {
    q: "3. MOOC是什麼意思？",
    options: ["A. 大型開放式線上課程", "B. 電子書", "C. 實體教室"],
    answer: 0
  },
  {
    q: "4. 哪個平台常用於線上作業繳交？",
    options: ["A. Google Classroom", "B. Word", "C. PowerPoint"],
    answer: 0
  },
  {
    q: "5. VR在教育科技中主要用於？",
    options: ["A. 沉浸式學習", "B. 打印文件", "C. 計算成績"],
    answer: 0
  }
];

function setup() {
  createCanvas(800, 600);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", results => predictions = results);
  textSize(28);
  textAlign(CENTER, CENTER);
}

function modelReady() {
  console.log("Handpose model loaded!");
}

function draw() {
  background(220);
  image(video, 0, 0, width, height);

  if (currentQuestion < questions.length) {
    showQuestion();
    if (predictions.length > 0 && !answered) {
      let hand = predictions[0];
      let x = hand.landmarks[8][0];
      let y = hand.landmarks[8][1];
      // 平滑化紅點座標
      pointerX += (x - pointerX) * smoothFactor;
      pointerY += (y - pointerY) * smoothFactor;
      fill(255, 0, 0);
      ellipse(pointerX, pointerY, 30, 30);

      let now = millis();
      let hovering = false;

      // 檢查是否選到選項
      for (let i = 0; i < 3; i++) {
        let bx = width / 2;
        let by = 250 + i * 80;
        if (dist(pointerX, pointerY, bx, by) < 60) {
          hovering = true;
          if (hoveringIndex !== i) {
            hoveringIndex = i;
            hoverStartTime = now;
          } else if (now - hoverStartTime > hoverConfirmTime) {
            answered = true;
            if (i === questions[currentQuestion].answer) {
              score++;
            }
            setTimeout(() => {
              currentQuestion++;
              answered = false;
              hoveringIndex = -1;
              hoverStartTime = null;
            }, 1000);
          }
          // 顯示進度圓環
          noFill();
          stroke(0, 200, 0);
          strokeWeight(6);
          let progress = constrain((now - hoverStartTime) / hoverConfirmTime, 0, 1);
          arc(bx, by, 70, 70, -HALF_PI, -HALF_PI + progress * TWO_PI);
          strokeWeight(1);
        }
      }
      if (!hovering) {
        hoveringIndex = -1;
        hoverStartTime = null;
      }
    } else {
      // 沒有偵測到手時，紅點維持原位
      fill(255, 0, 0, 100);
      ellipse(pointerX, pointerY, 30, 30);
    }
  } else {
    fill(0, 200, 0);
    textSize(40);
    text("遊戲結束！你的分數：" + score + "/" + questions.length, width / 2, height / 2);
  }
}

function showQuestion() {
  fill(0);
  textSize(28);
  text(questions[currentQuestion].q, width / 2, 100);
  for (let i = 0; i < 3; i++) {
    fill(255);
    stroke(0);
    rect(width / 2 - 150, 220 + i * 80, 300, 60, 20);
    fill(0);
    noStroke();
    text(questions[currentQuestion].options[i], width / 2, 250 + i * 80);
  }
}
