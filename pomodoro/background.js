const images = [
  "1.jpg", "2.jpg", "3.jpg"
]

// 페이지를 로딩했을 때 바로 시작되도록
const body = document.querySelector("body");
changeBackgroundImage();

function changeBackgroundImage() {
  // 1) 랜덤으로 이미지를 하나 뽑는다.
  const pickRandomImage = images[ Math.floor(Math.random() * images.length) ];
  // 2) body 태그의 배경화면으로 설정한다.
  body.style.backgroundImage = `url( "img/${pickRandomImage}" )`;
}

const minute = 1000 * 60;
const imgChangeTime = 1 * minute;
setInterval(changeBackgroundImage, imgChangeTime);