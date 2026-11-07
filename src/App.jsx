import { useState, useEffect } from "react";
import "./App.css";
const API = "http://localhost:4000";

// =========================
// 학과별 전공책 추천 데이터
// =========================

const majorBookRecommendations = {
  "AI빅데이터학과": [
    { id: 101, title: "머신러닝 개론", author: "김민수", price: "18,000원" },
    { id: 102, title: "데이터 구조와 알고리즘", author: "이지훈", price: "22,000원" },
    { id: 103, title: "통계학의 이해", author: "박서연", price: "16,000원" },
  ],
  "경영학과": [
    { id: 104, title: "경영학원론", author: "최우진", price: "20,000원" },
    { id: 105, title: "마케팅 관리", author: "정하은", price: "19,000원" },
  ],
  "컴퓨터공학과": [
    { id: 106, title: "운영체제", author: "한도윤", price: "23,000원" },
    { id: 107, title: "자료구조론", author: "윤서준", price: "21,000원" },
  ],
  default: [
    { id: 199, title: "대학 글쓰기", author: "공통교재", price: "12,000원" },
  ],
};

function getRecommendedBooks(department) {
  return (
    majorBookRecommendations[department] ||
    majorBookRecommendations.default
  );
}

const reportReasons = [
  "사기 의심",
  "허위 매물",
  "부적절한 상품",
  "욕설/비매너",
  "기타",
];

// =========================
// 카풀 추천용 샘플 학생 데이터
// =========================
const sampleCarpoolUsers = [
  {
    id: 1,
    nickname: "통학러01",
    department: "AI빅데이터학과",
    role: "운전자",
    region: "의정부",
    departureTime: "08:10",
    days: ["월", "화", "수", "목"],
    schedule: [
      { day: "월", start: "09:00", end: "15:00" },
      { day: "화", start: "10:00", end: "16:00" },
      { day: "수", start: "09:00", end: "15:00" },
    ],
  },
  {
    id: 2,
    nickname: "대진카풀",
    department: "컴퓨터공학과",
    role: "운전자",
    region: "도봉구",
    departureTime: "08:30",
    days: ["월", "수", "금"],
    schedule: [
      { day: "월", start: "09:00", end: "16:00" },
      { day: "수", start: "10:00", end: "16:00" },
      { day: "금", start: "09:00", end: "15:00" },
    ],
  },
  {
    id: 3,
    nickname: "학교가는길",
    department: "경영학과",
    role: "탑승자",
    region: "의정부",
    departureTime: "08:20",
    days: ["월", "화", "수"],
    schedule: [
      { day: "월", start: "09:00", end: "15:00" },
      { day: "화", start: "10:00", end: "16:00" },
      { day: "수", start: "09:00", end: "15:00" },
    ],
  },
  {
    id: 4,
    nickname: "통학메이트",
    department: "간호학과",
    role: "운전자",
    region: "노원구",
    departureTime: "08:00",
    days: ["화", "목"],
    schedule: [
      { day: "화", start: "09:00", end: "16:00" },
      { day: "목", start: "09:00", end: "16:00" },
    ],
  },
  {
    id: 5,
    nickname: "대진학생22",
    department: "AI빅데이터학과",
    role: "운전자",
    region: "의정부",
    departureTime: "08:40",
    days: ["월", "수", "금"],
    schedule: [
      { day: "월", start: "10:00", end: "16:00" },
      { day: "수", start: "10:00", end: "16:00" },
      { day: "금", start: "09:00", end: "15:00" },
    ],
  },
];

function App() {
  // =========================
  // 화면 상태
  // =========================

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");

  // =========================
  // 로그인 사용자 (로컬스토리지 토큰 연동)
  // =========================

  const [currentUser, setCurrentUser] = useState(null);

  // 새로고침 시 저장된 토큰으로 내 정보 복원
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) return;

    fetch(`${API}/api/me`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          localStorage.removeItem("token");
          throw new Error("토큰 만료");
        }
        return res.json();
      })
      .then((userData) => {
        setCurrentUser({ ...userData, token: savedToken });
      })
      .catch(() => {
        localStorage.removeItem("token");
        setCurrentUser(null);
      });
  }, []);

  // 관리자 대시보드 데이터
  const [adminDashboard, setAdminDashboard] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  // =========================
  // 검색
  // =========================

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  // =========================
  // 찜
  // =========================

  const [favoriteIds, setFavoriteIds] = useState([]);

  // =========================
  // 채팅
  // =========================

  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [chatInput, setChatInput] = useState("");

  // =========================
  // 신고
  // =========================

  const [reports, setReports] = useState([]);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetail, setReportDetail] = useState("");

  // =========================
  // 거래내역
  // =========================

  const [transactions, setTransactions] = useState([]);

  // =========================
  // 카풀 정보
  // =========================

  const [carpoolInfo, setCarpoolInfo] = useState(null);
  const [showCarpoolRegister, setShowCarpoolRegister] = useState(false);
  const [carpoolRole, setCarpoolRole] = useState("");
  const [carpoolRegion, setCarpoolRegion] = useState("");
  const [carpoolTime, setCarpoolTime] = useState("");
  const [carpoolDays, setCarpoolDays] = useState([]);
  const [carpoolSchedule, setCarpoolSchedule] = useState([
    { day: "월", start: "", end: "" },
    { day: "화", start: "", end: "" },
    { day: "수", start: "", end: "" },
    { day: "목", start: "", end: "" },
    { day: "금", start: "", end: "" },
  ]);

  const [carpoolRequests, setCarpoolRequests] = useState([]);

  // =========================
  // 회원가입 정보
  // =========================

  const [signupName, setSignupName] = useState("");
  const [signupStudentId, setSignupStudentId] = useState("");
  const [signupDepartment, setSignupDepartment] = useState("");
  const [signupYear, setSignupYear] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupNickname, setSignupNickname] = useState("");

  // =========================
  // 로그인 정보
  // =========================

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // =========================
  // 상품 목록 (DB에서 불러옴)
  // =========================

  const [products, setProducts] = useState([]);

  const formatTimeAgo = (dateString) => {
    const minutes = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 60000
    );

    if (isNaN(minutes)) return "";
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
    return `${Math.floor(minutes / 1440)}일 전`;
  };

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API}/api/products`);
      const rows = await response.json();

      setProducts(
        rows.map((row) => ({
          id: row.id,
          title: row.title,
          price: `${Number(row.price).toLocaleString()}원`,
          category: row.category,
          location: row.location || "대진대학교",
          time: formatTimeAgo(row.created_at),
          seller: row.seller,
          description: row.description || "상품 설명이 없습니다.",
          condition: row.item_condition,
          imageUrl: row.image_url ? `${API}${row.image_url}` : "",
        }))
      );
    } catch (error) {
      console.error("상품 목록을 불러오지 못했습니다.", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // 로그인한 사용자의 채팅방을 서버에서 불러오고 주기적으로 갱신
  useEffect(() => {
    if (!currentUser?.token) {
      setChatRooms([]);
      setSelectedChatRoom(null);
      return;
    }

    const loadChatRooms = async () => {
      try {
        const response = await fetch(`${API}/api/chat-rooms`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "채팅 목록을 불러오지 못했습니다.");

        setChatRooms(data);
        setSelectedChatRoom((currentRoom) => {
          if (!currentRoom) return null;
          return data.find((room) => room.id === currentRoom.id) || currentRoom;
        });
      } catch (error) {
        console.error("채팅 목록 조회 오류:", error);
      }
    };

    loadChatRooms();
    const timer = setInterval(loadChatRooms, 3000);
    return () => clearInterval(timer);
  }, [currentUser?.token]);

  const openAdminPage = async () => {
    if (!currentUser || currentUser.role !== "admin") {
      alert("관리자만 접근할 수 있습니다.");
      return;
    }
    setCurrentPage("admin");
    setAdminLoading(true);
    setAdminError("");
    try {
      const response = await fetch(`${API}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "관리자 정보를 불러오지 못했습니다.");
      setAdminDashboard(data);
    } catch (error) {
      setAdminError(error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // =========================
  // 상품 등록 정보
  // =========================

  const [registerCategory, setRegisterCategory] = useState("");
  const [registerTitle, setRegisterTitle] = useState("");
  const [registerPrice, setRegisterPrice] = useState("");
  const [registerCondition, setRegisterCondition] = useState("");
  const [registerDescription, setRegisterDescription] = useState("");
  const [registerImage, setRegisterImage] = useState(null);
  const [registerImagePreview, setRegisterImagePreview] = useState("");

  const handleRegisterImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 선택할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("사진은 5MB 이하로 선택해주세요.");
      event.target.value = "";
      return;
    }

    setRegisterImage(file);
    setRegisterImagePreview(URL.createObjectURL(file));
  };

  // =========================
  // 찜 기능
  // =========================

  const toggleFavorite = (productId) => {
    setFavoriteIds((currentIds) => {
      if (currentIds.includes(productId)) {
        return currentIds.filter((id) => id !== productId);
      }
      return [...currentIds, productId];
    });
  };

  const favoriteProducts = products.filter((product) =>
    favoriteIds.includes(product.id)
  );

  // =========================
  // 채팅 시작
  // =========================

  const handleStartChat = async (product) => {
    if (!currentUser) {
      alert("채팅하려면 먼저 로그인해주세요.");
      setSelectedProduct(null);
      setShowLogin(true);
      return;
    }

    if (product.seller === currentUser.nickname) {
      alert("본인이 등록한 상품입니다.");
      return;
    }

    try {
      const response = await fetch(`${API}/api/chat-rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ productId: product.id }),
      });
      const room = await response.json();
      if (!response.ok) throw new Error(room.error || "채팅방을 만들지 못했습니다.");

      setChatRooms((currentRooms) => [
        room,
        ...currentRooms.filter((item) => item.id !== room.id),
      ]);
      setSelectedChatRoom(room);
      setSelectedProduct(null);
    } catch (error) {
      console.error("채팅 시작 오류:", error);
      alert(error.message || "채팅을 시작하지 못했습니다.");
    }
  };

  // =========================
  // 메시지 전송
  // =========================

  const handleSendMessage = async () => {
    const messageText = chatInput.trim();
    if (!messageText || !selectedChatRoom || !currentUser) return;

    try {
      const response = await fetch(`${API}/api/chat-rooms/${selectedChatRoom.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ text: messageText }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "메시지를 전송하지 못했습니다.");

      const newMessage = {
        id: result.id,
        sender: currentUser.nickname,
        text: messageText,
      };
      const updatedRoom = {
        ...selectedChatRoom,
        messages: [...(selectedChatRoom.messages || []), newMessage],
      };

      setChatRooms((currentRooms) =>
        currentRooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room))
      );
      setSelectedChatRoom(updatedRoom);
      setChatInput("");
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      alert(error.message || "메시지를 전송하지 못했습니다.");
    }
  };

  // =========================
  // 신고하기
  // =========================

  const handleReportProduct = (product) => {
    if (!currentUser) {
      alert("신고하려면 먼저 로그인해주세요.");
      setSelectedProduct(null);
      setShowLogin(true);
      return;
    }

    setReportTarget(product);
  };

  const closeReportScreen = () => {
    setReportTarget(null);
    setReportReason("");
    setReportDetail("");
  };

  const handleSubmitReport = async () => {
    if (!reportReason) {
      alert("신고 사유를 선택해주세요.");
      return;
    }

    try {
      const response = await fetch(`${API}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify({
          productId: reportTarget.id,
          productTitle: reportTarget.title,
          reason: reportReason,
          detail: reportDetail,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "신고 접수에 실패했습니다.");
        return;
      }

      closeReportScreen();
      alert("신고가 정상적으로 접수되었습니다.");
    } catch (e) {
      console.error("신고 접수 오류:", e);
      alert("서버 오류로 신고를 접수하지 못했습니다.");
    }
  };

  // =========================
  // 거래 완료 처리
  // =========================

  const handleCompleteTransaction = (room) => {
    const relatedProduct = products.find(
      (product) => product.id === room.productId
    );

    const newTransaction = {
      id: Date.now(),
      productId: room.productId,
      productTitle: room.productTitle,
      price: relatedProduct ? relatedProduct.price : "",
      buyerNickname: room.buyerNickname,
      sellerNickname: room.sellerNickname,
      date: new Date().toLocaleDateString(),
    };

    setTransactions((currentTransactions) => [
      newTransaction,
      ...currentTransactions,
    ]);

    alert("거래가 완료 처리되었습니다.");
  };

  // =========================
  // 검색 + 카테고리
  // =========================

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "전체" ||
      product.category === selectedCategory;

    const keyword = searchText.trim().toLowerCase();

    const matchesSearch =
      keyword === "" ||
      product.title.toLowerCase().includes(keyword) ||
      product.category.toLowerCase().includes(keyword) ||
      product.description.toLowerCase().includes(keyword);

    return matchesCategory && matchesSearch;
  });

  // =========================
  // 카풀 정보 저장
  // =========================

  const handleCarpoolSave = () => {
    if (!currentUser) {
      alert("카풀 정보를 등록하려면 먼저 로그인해주세요.");
      setShowCarpoolRegister(false);
      setShowLogin(true);
      return;
    }

    if (!carpoolRole || !carpoolRegion || !carpoolTime || carpoolDays.length === 0) {
      alert("역할, 출발 지역, 희망 출발 시간, 이용 요일을 모두 입력해주세요.");
      return;
    }

    const validSchedule = carpoolSchedule.filter(
      (item) => item.start && item.end
    );

    const newCarpoolInfo = {
      role: carpoolRole,
      region: carpoolRegion,
      departureTime: carpoolTime,
      days: carpoolDays,
      schedule: validSchedule,
    };

    setCarpoolInfo(newCarpoolInfo);
    setShowCarpoolRegister(false);
    setCurrentPage("carpool");
    alert("카풀 정보가 저장되었습니다.");
  };

  const toggleCarpoolDay = (day) => {
    setCarpoolDays((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((item) => item !== day)
        : [...currentDays, day]
    );
  };

  const updateCarpoolSchedule = (day, field, value) => {
    setCarpoolSchedule((currentSchedule) =>
      currentSchedule.map((item) =>
        item.day === day ? { ...item, [field]: value } : item
      )
    );
  };

  // =========================
  // 회원가입
  // =========================

  const handleSignup = async () => {
    if (
      !signupName ||
      !signupStudentId ||
      !signupDepartment ||
      !signupYear ||
      !signupEmail ||
      !signupPassword ||
      !signupNickname
    ) {
      alert("모든 회원가입 정보를 입력해주세요.");
      return;
    }

    if (signupStudentId.length < 4) {
      alert("학번을 정확하게 입력해주세요.");
      return;
    }

    if (signupPassword.length < 6) {
      alert("비밀번호는 6자리 이상 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${API}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          studentId: signupStudentId,
          department: signupDepartment,
          year: signupYear,
          email: signupEmail,
          password: signupPassword,
          nickname: signupNickname,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      setCurrentUser(data);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      alert(`${signupNickname}님, 회원가입이 완료되었습니다.`);

      setSignupName("");
      setSignupStudentId("");
      setSignupDepartment("");
      setSignupYear("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupNickname("");

      setShowSignup(false);
      setCurrentPage("home");
    } catch (error) {
      alert("서버에 연결할 수 없습니다. 서버가 켜져 있는지 확인해주세요.");
    }
  };

  // =========================
  // 로그인
  // =========================

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      setCurrentUser(data);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setLoginEmail("");
      setLoginPassword("");

      setShowLogin(false);
      setCurrentPage("home");

      alert(`${data.nickname}님, 로그인되었습니다.`);
    } catch (error) {
      alert("서버에 연결할 수 없습니다. 서버가 켜져 있는지 확인해주세요.");
    }
  };

  // =========================
  // 로그아웃 (토큰 삭제 및 상태 초기화)
  // =========================

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");
    setCurrentPage("home");

    alert("로그아웃되었습니다.");
  };

  // =========================
  // 상품 등록
  // =========================

  const handleProductRegister = async () => {
    if (!currentUser) {
      alert("상품을 등록하려면 먼저 로그인해주세요.");
      setShowRegister(false);
      setShowLogin(true);
      return;
    }

    if (!registerCategory || !registerTitle || !registerPrice) {
      alert("카테고리, 상품명, 가격을 입력해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", registerTitle);
      formData.append("price", String(Number(registerPrice)));
      formData.append("category", registerCategory);
      formData.append("condition", registerCondition);
      formData.append("description", registerDescription || "상품 설명이 없습니다.");
      if (registerImage) formData.append("image", registerImage);

      const response = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      await loadProducts();

      setRegisterCategory("");
      setRegisterTitle("");
      setRegisterPrice("");
      setRegisterCondition("");
      setRegisterDescription("");
      setRegisterImage(null);
      setRegisterImagePreview("");

      setShowRegister(false);
      setCurrentPage("home");

      alert("상품이 등록되었습니다.");
    } catch (error) {
      alert("서버에 연결할 수 없습니다. 서버가 켜져 있는지 확인해주세요.");
    }
  };

  // =========================
  // 화면 렌더링 (회원가입)
  // =========================

  if (showSignup) {
    return (
      <div className="app">
        <header className="detail-header">
          <button className="back-button" onClick={() => setShowSignup(false)}>
            ←
          </button>
          <h1>회원가입</h1>
        </header>

        <main className="auth-main">
          <div className="auth-title">
            <h2>대진 중고마켓 가입</h2>
            <p>대진대학교 학생 정보를 입력해주세요.</p>
          </div>

          <label>실명</label>
          <input
            type="text"
            placeholder="실명을 입력하세요"
            value={signupName}
            onChange={(e) => setSignupName(e.target.value)}
          />

          <label>학번</label>
          <input
            type="text"
            placeholder="학번을 입력하세요"
            value={signupStudentId}
            onChange={(e) => setSignupStudentId(e.target.value)}
          />

          <label>학과</label>
          <input
            type="text"
            placeholder="예: AI빅데이터학과"
            value={signupDepartment}
            onChange={(e) => setSignupDepartment(e.target.value)}
          />

          <label>학년</label>
          <select value={signupYear} onChange={(e) => setSignupYear(e.target.value)}>
            <option value="">학년을 선택하세요</option>
            <option value="1학년">1학년</option>
            <option value="2학년">2학년</option>
            <option value="3학년">3학년</option>
            <option value="4학년">4학년</option>
            <option value="5학년 이상">5학년 이상</option>
          </select>

          <label>이메일</label>
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
          />

          <label>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호 6자리 이상"
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
          />

          <label>닉네임</label>
          <input
            type="text"
            placeholder="활동할 닉네임을 입력하세요"
            value={signupNickname}
            onChange={(e) => setSignupNickname(e.target.value)}
          />

          <button className="auth-button" onClick={handleSignup}>
            회원가입
          </button>

          <button
            className="text-button"
            onClick={() => {
              setShowSignup(false);
              setShowLogin(true);
            }}
          >
            이미 계정이 있으신가요? 로그인
          </button>
        </main>
      </div>
    );
  }

  // =========================
  // 화면 렌더링 (로그인)
  // =========================

  if (showLogin) {
    return (
      <div className="app">
        <header className="detail-header">
          <button className="back-button" onClick={() => setShowLogin(false)}>
            ←
          </button>
          <h1>로그인</h1>
        </header>

        <main className="auth-main">
          <div className="auth-title">
            <h2>대진 중고마켓</h2>
            <p>로그인하고 거래를 시작해보세요.</p>
          </div>

          <label>이메일</label>
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />

          <label>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />

          <button className="auth-button" onClick={handleLogin}>
            로그인
          </button>

          <button
            className="text-button"
            onClick={() => {
              setShowLogin(false);
              setShowSignup(true);
            }}
          >
            아직 회원이 아니신가요? 회원가입
          </button>
        </main>
      </div>
    );
  }

  // =========================
  // 화면 렌더링 (상품 등록)
  // =========================

  if (showRegister) {
    return (
      <div className="app">
        <header className="detail-header">
          <button className="back-button" onClick={() => setShowRegister(false)}>
            ←
          </button>
          <h1>상품 등록</h1>
        </header>

        <main className="register-main">
          <label htmlFor="register-product-image" className="photo-upload" style={{ cursor: "pointer", overflow: "hidden" }}>
            {registerImagePreview ? (
              <img src={registerImagePreview} alt="선택한 상품 사진 미리보기" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
            ) : (
              <>
                <span>📷</span>
                <p>사진 등록</p>
              </>
            )}
          </label>
          <input
            id="register-product-image"
            type="file"
            accept="image/*"
            onChange={handleRegisterImageChange}
            style={{ display: "none" }}
          />

          <label>카테고리</label>
          <select value={registerCategory} onChange={(e) => setRegisterCategory(e.target.value)}>
            <option value="">카테고리를 선택하세요</option>
            <option value="전자기기">전자기기</option>
            <option value="도서">도서</option>
            <option value="의류">의류</option>
            <option value="생활용품">생활용품</option>
          </select>

          <label>상품명</label>
          <input
            type="text"
            placeholder="상품명을 입력하세요"
            value={registerTitle}
            onChange={(e) => setRegisterTitle(e.target.value)}
          />

          <label>가격</label>
          <input
            type="number"
            placeholder="가격을 입력하세요"
            value={registerPrice}
            onChange={(e) => setRegisterPrice(e.target.value)}
          />

          <label>상품 상태</label>
          <select value={registerCondition} onChange={(e) => setRegisterCondition(e.target.value)}>
            <option value="">상품 상태를 선택하세요</option>
            <option value="새 상품">새 상품</option>
            <option value="사용감 적음">사용감 적음</option>
            <option value="사용감 있음">사용감 있음</option>
          </select>

          <label>상품 설명</label>
          <textarea
            placeholder="상품에 대한 설명을 입력하세요"
            rows="6"
            value={registerDescription}
            onChange={(e) => setRegisterDescription(e.target.value)}
          />

          <button className="register-button" onClick={handleProductRegister}>
            상품 등록
          </button>
        </main>
      </div>
    );
  }

  // =========================
  // 화면 렌더링 (채팅방)
  // =========================

  if (selectedChatRoom && currentUser) {
    const opponent =
      selectedChatRoom.buyerNickname === currentUser.nickname
        ? selectedChatRoom.sellerNickname
        : selectedChatRoom.buyerNickname;

    return (
      <div className="app">
        <header className="detail-header">
          <button className="back-button" onClick={() => setSelectedChatRoom(null)}>
            ←
          </button>
          <h1>{opponent}</h1>
        </header>

        <main className="chat-main">
          <div className="chat-product-info">
            📦 {selectedChatRoom.productTitle}
          </div>

          <button
            className="complete-transaction-button"
            onClick={() => handleCompleteTransaction(selectedChatRoom)}
          >
            거래 완료 처리
          </button>

          <div className="chat-messages">
            {(!selectedChatRoom.messages || selectedChatRoom.messages.length === 0) ? (
              <p className="chat-empty">대화를 시작해보세요.</p>
            ) : (
              selectedChatRoom.messages.map((message) => (
                <div
                  className={`chat-bubble-row ${
                    message.sender === currentUser.nickname ? "mine" : "theirs"
                  }`}
                  key={message.id}
                >
                  <div className="chat-bubble">{message.text}</div>
                </div>
              ))
            )}
          </div>
        </main>

        <div className="chat-input-bar">
          <input
            type="text"
            placeholder="메시지를 입력하세요"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
          />
          <button onClick={handleSendMessage}>전송</button>
        </div>
      </div>
    );
  }

  // =========================
  // 신고 화면
  // =========================

  if (reportTarget && currentUser) {
    return (
      <div className="app">
        <header className="detail-header">
          <button className="back-button" onClick={closeReportScreen}>
            ←
          </button>
          <h1>신고하기</h1>
        </header>

        <main className="report-main">
          <div className="chat-product-info">📦 {reportTarget.title}</div>
          <label>신고 사유</label>
          <div className="report-reasons">
            {reportReasons.map((reason) => (
              <button
                key={reason}
                className={`report-reason ${reportReason === reason ? "active" : ""}`}
                onClick={() => setReportReason(reason)}
              >
                {reason}
              </button>
            ))}
          </div>
          <label>상세 내용 (선택)</label>
          <textarea
            placeholder="신고 내용을 자세히 적어주세요"
            rows="5"
            value={reportDetail}
            onChange={(e) => setReportDetail(e.target.value)}
          />
          <button className="report-submit-button" onClick={handleSubmitReport}>
            신고 접수
          </button>
        </main>
      </div>
    );
  }

  // =========================
  // 상품 상세
  // =========================

  if (selectedProduct) {
    const isFavorite = favoriteIds.includes(selectedProduct.id);

    return (
      <div className="app">
        <header className="detail-header">
          <button className="back-button" onClick={() => setSelectedProduct(null)}>
            ←
          </button>
          <h1>상품 상세</h1>
        </header>

        <main className="detail-main">
          {selectedProduct.imageUrl ? (
            <div className="detail-image" style={{ padding: 0, overflow: "hidden" }}>
              <img src={selectedProduct.imageUrl} alt={selectedProduct.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ) : (
            <div className="detail-image">📦</div>
          )}

          <div className="detail-content">
            <span className="category">{selectedProduct.category}</span>
            <h2>{selectedProduct.title}</h2>
            <strong className="detail-price">{selectedProduct.price}</strong>
            <p className="detail-location">
              {selectedProduct.location} · {selectedProduct.time}
            </p>
            <hr />
            <h3>상품 설명</h3>
            <p className="description">{selectedProduct.description}</p>
            <hr />
            <div className="seller">
              <div className="seller-icon">👤</div>
              <div>
                <strong>{selectedProduct.seller}</strong>
                <p>대진대학교 학생</p>
              </div>
            </div>
          </div>
        </main>

        <div className="detail-buttons">
          <button
            className={`favorite-button ${isFavorite ? "favorite-active" : ""}`}
            onClick={() => toggleFavorite(selectedProduct.id)}
          >
            {isFavorite ? "♥ 찜 완료" : "♡ 찜하기"}
          </button>

          <button
            className="chat-button"
            onClick={() => handleStartChat(selectedProduct)}
          >
            💬 채팅하기
          </button>

          <button
            className="report-button"
            onClick={() => handleReportProduct(selectedProduct)}
          >
            🚨 신고하기
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // 찜 화면
  // =========================

  if (currentPage === "favorites") {
    return (
      <div className="app">
        <header className="page-header">
          <h1>찜한 상품</h1>
        </header>

        <main className="main">
          {favoriteProducts.length === 0 ? (
            <div className="no-products">
              <div>♡</div>
              <h3>찜한 상품이 없습니다.</h3>
              <p>마음에 드는 상품의 하트를 눌러보세요.</p>
            </div>
          ) : (
            <div className="product-list">
              {favoriteProducts.map((product) => (
                <div
                  className="product-card"
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.imageUrl ? (
                    <div className="product-image" style={{ padding: 0, overflow: "hidden" }}>
                      <img src={product.imageUrl} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div className="product-image">📦</div>
                  )}
                  <div className="product-info">
                    <span className="category">{product.category}</span>
                    <h3>{product.title}</h3>
                    <strong>{product.price}</strong>
                    <p>
                      {product.location} · {product.time}
                    </p>
                  </div>
                  <button
                    className="heart favorite-heart"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                  >
                    ♥
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>

        <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    );
  }

  // =========================
  // 채팅 목록 화면
  // =========================

  if (currentPage === "chatList") {
    const myChatRooms = chatRooms.filter(
      (room) =>
        currentUser &&
        (room.buyerNickname === currentUser.nickname ||
          room.sellerNickname === currentUser.nickname)
    );

    return (
      <div className="app">
        <header className="page-header">
          <h1>채팅</h1>
        </header>

        <main className="main">
          {!currentUser ? (
            <div className="login-required">
              <div>💬</div>
              <h3>로그인이 필요합니다.</h3>
              <button className="auth-button" onClick={() => setShowLogin(true)}>
                로그인
              </button>
            </div>
          ) : myChatRooms.length === 0 ? (
            <div className="no-products">
              <div>💬</div>
              <h3>채팅 내역이 없습니다.</h3>
              <p>상품 상세에서 채팅하기를 눌러 대화를 시작해보세요.</p>
            </div>
          ) : (
            <div className="chat-room-list">
              {myChatRooms.map((room) => {
                const opponent =
                  room.buyerNickname === currentUser.nickname
                    ? room.sellerNickname
                    : room.buyerNickname;

                const lastMessage = room.messages?.[room.messages.length - 1];

                return (
                  <div
                    className="chat-room-card"
                    key={room.id}
                    onClick={() => setSelectedChatRoom(room)}
                  >
                    <div className="chat-room-icon">👤</div>
                    <div className="chat-room-info">
                      <strong>{opponent}</strong>
                      <p>{room.productTitle}</p>
                      <span>
                        {lastMessage ? lastMessage.text : "대화 내용이 없습니다."}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    );
  }

  // =========================
  // 관리자 대시보드
  // =========================

  if (currentPage === "admin") {
    const summary = adminDashboard?.summary;

    return (
      <div className="app admin-app">
        <header className="page-header admin-header">
          <button className="admin-back-button" onClick={() => setCurrentPage("mypage")}>
            ← 마이페이지
          </button>
          <h1>관리자 대시보드</h1>
          <p>대진 중고마켓 운영 현황 및 신고 관리</p>
        </header>
        <main className="admin-main">
          {adminLoading ? <p className="admin-message">통계 데이터 로딩 중...</p> : null}
          {adminError ? <p className="admin-error">{adminError}</p> : null}
          {summary ? (
            <>
              <section className="admin-stat-grid">
                <div className="admin-stat-card">
                  <span>전체 회원</span>
                  <strong>{summary.users.toLocaleString()}명</strong>
                </div>
                <div className="admin-stat-card">
                  <span>등록 상품</span>
                  <strong>{summary.products.toLocaleString()}개</strong>
                </div>
              </section>

              <section className="admin-panel">
                <div className="admin-section-title">
                  <h2>접수된 신고 관리</h2>
                  <span>총 {adminDashboard?.reports?.length || 0}건</span>
                </div>
                {adminDashboard?.reports?.length === 0 ? (
                  <p className="admin-empty">접수된 신고가 없습니다.</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>상품명</th>
                        <th>신고자</th>
                        <th>사유</th>
                        <th>상태</th>
                        <th>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminDashboard?.reports?.map((rep) => (
                        <tr key={rep.id}>
                          <td>{rep.id}</td>
                          <td>{rep.productTitle}</td>
                          <td>{rep.reporter}</td>
                          <td>{rep.reason}</td>
                          <td>{rep.status}</td>
                          <td>
                            {rep.status !== "처리 완료" && (
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await fetch(
                                      `${API}/api/admin/reports/${rep.id}/complete`,
                                      {
                                        method: "PATCH",
                                        headers: {
                                          Authorization: `Bearer ${currentUser.token}`,
                                        },
                                      }
                                    );
                                    if (!res.ok) throw new Error("처리 실패");
                                    alert("신고가 처리 완료되었습니다.");
                                    openAdminPage();
                                  } catch (err) {
                                    alert(err.message);
                                  }
                                }}
                              >
                                처리 완료
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </>
          ) : null}
        </main>
      </div>
    );
  }

  // =========================
  // 거래내역
  // =========================

  if (currentPage === "transactions") {
    return (
      <div className="app">
        <header className="page-header">
          <h1>거래내역</h1>
        </header>
        <main className="main">
          <div className="no-products">
            <div>📋</div>
            <h3>거래내역 화면입니다.</h3>
          </div>
        </main>
        <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    );
  }

  // =========================
  // 마이페이지
  // =========================

  if (currentPage === "mypage") {
    return (
      <div className="app">
        <header className="page-header">
          <h1>마이페이지</h1>
        </header>

        <main className="mypage-main">
          {currentUser ? (
            <>
              <div className="profile-card">
                <div className="profile-icon">👤</div>
                <div>
                  <h2>{currentUser.nickname}</h2>
                  <p>{currentUser.department} · {currentUser.year}</p>
                </div>
              </div>

              {currentUser.role === "admin" && (
                <button className="admin-open-button" onClick={openAdminPage}>
                  📊 관리자 페이지 열기
                </button>
              )}

              <button className="logout-button" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <div className="login-required">
              <div>👤</div>
              <h3>로그인이 필요합니다.</h3>
              <button className="auth-button" onClick={() => setShowLogin(true)}>
                로그인
              </button>
            </div>
          )}
        </main>

        <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    );
  }

  // =========================
  // 홈 화면
  // =========================

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <h1>대진 중고마켓</h1>
          {!currentUser ? (
            <button
              className="login-small-button"
              onClick={() => setShowLogin(true)}
            >
              로그인
            </button>
          ) : (
            <span className="welcome-text">{currentUser.nickname}님</span>
          )}
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="상품을 검색해보세요"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button>🔍</button>
        </div>
      </header>

      <nav className="categories">
        {["전체", "전자기기", "도서", "의류", "생활용품"].map((category) => (
          <button
            key={category}
            className={selectedCategory === category ? "active" : ""}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      <main className="main">
        <div className="section-title">
          <h2>최근 올라온 상품</h2>
          <span>{filteredProducts.length}개의 상품</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <div>🔍</div>
            <h3>상품이 없습니다.</h3>
          </div>
        ) : (
          <div className="product-list">
            {filteredProducts.map((product) => {
              const isFavorite = favoriteIds.includes(product.id);

              return (
                <div
                  className="product-card"
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.imageUrl ? (
                    <div className="product-image" style={{ padding: 0, overflow: "hidden" }}>
                      <img src={product.imageUrl} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div className="product-image">📦</div>
                  )}
                  <div className="product-info">
                    <span className="category">{product.category}</span>
                    <h3>{product.title}</h3>
                    <strong>{product.price}</strong>
                    <p>
                      {product.location} · {product.time}
                    </p>
                  </div>
                  <button
                    className={`heart ${isFavorite ? "favorite-heart" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                  >
                    {isFavorite ? "♥" : "♡"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <button className="add-product" onClick={() => setShowRegister(true)}>
        ＋ 상품 등록
      </button>

      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
}

// =========================
// 하단 메뉴
// =========================

function BottomNav({ currentPage, setCurrentPage }) {
  return (
    <nav className="bottom-nav">
      <div
        className={`nav-item ${currentPage === "home" ? "active" : ""}`}
        onClick={() => setCurrentPage("home")}
      >
        <span>🏠</span>
        <p>홈</p>
      </div>

      <div
        className={`nav-item ${currentPage === "favorites" ? "active" : ""}`}
        onClick={() => setCurrentPage("favorites")}
      >
        <span>♡</span>
        <p>찜</p>
      </div>

      <div
        className={`nav-item ${currentPage === "chatList" ? "active" : ""}`}
        onClick={() => setCurrentPage("chatList")}
      >
        <span>💬</span>
        <p>채팅</p>
      </div>

      <div
        className={`nav-item ${currentPage === "transactions" ? "active" : ""}`}
        onClick={() => setCurrentPage("transactions")}
      >
        <span>📋</span>
        <p>거래</p>
      </div>

      <div
        className={`nav-item ${currentPage === "carpool" ? "active" : ""}`}
        onClick={() => setCurrentPage("carpool")}
      >
        <span>🚗</span>
        <p>카풀</p>
      </div>

      <div
        className={`nav-item ${currentPage === "mypage" ? "active" : ""}`}
        onClick={() => setCurrentPage("mypage")}
      >
        <span>👤</span>
        <p>마이페이지</p>
      </div>
    </nav>
  );
}

export default App;