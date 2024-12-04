const countryFlag = document.getElementById("countryFlag");
const quizInput = document.getElementById("quizInput");
const submitBtn = document.getElementById("submitBtn");
const newCountryBtn = document.getElementById("newCountryBtn");
const quizFeedback = document.getElementById("quizFeedback");

let correctAnswer = ""; // 정답 저장

// 랜덤 국가 데이터 가져오기
const fetchRandomCountry = async () => {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all");
    if (!response.ok) throw new Error("Failed to fetch country data.");
    const countries = await response.json();
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];

    // 국기와 정답 설정
    countryFlag.src = randomCountry.flags.png || randomCountry.flags.svg || "";
    correctAnswer = randomCountry.name.common;

    // 입력 필드 초기화 및 피드백 초기화
    quizInput.value = "";
    quizFeedback.textContent = "";
  } catch (error) {
    console.error("Error fetching country data:", error);
    quizFeedback.textContent = "데이터를 가져오는 중 오류가 발생했습니다.";
  }
};

// 정답 확인
const checkAnswer = () => {
  const userAnswer = quizInput.value.trim().toLowerCase(); // 입력값 가져오기
  if (!userAnswer) {
    quizFeedback.textContent = "답을 입력하세요!";
    return;
  }
  if (userAnswer === correctAnswer.toLowerCase()) {
    quizFeedback.textContent = "정답입니다! 🎉";
    quizFeedback.style.color = "#4caf50";
  } else {
    quizFeedback.textContent = `오답입니다! 정답은 ${correctAnswer}입니다. 😢`;
    quizFeedback.style.color = "#f44336";
  }
};

// 이벤트 리스너
submitBtn.addEventListener("click", checkAnswer); // 정답 제출
newCountryBtn.addEventListener("click", fetchRandomCountry); // 새로운 퀴즈 가져오기

// 초기 퀴즈 로드
fetchRandomCountry();
