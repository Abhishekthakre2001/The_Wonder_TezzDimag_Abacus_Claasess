import React, { useState, useEffect } from 'react'
import StudentAppBar from './StudentAppBar';
import Button from '../../UI/Button';
import { useNavigate } from 'react-router-dom';
import examScheduleApi from '../../api/examScheduleApi';
import questionApi from '../../api/questionApi';
import resultapi from '../../api/result';
import { useFetchData } from '../../hooks/useFetchData';
import TopAutoCarousel from './LightDashboardCard';
import CreamCarouselCard from './CreamCarouselCard';
import examImg from "../../assets/exam.png";
import Modal from '../../UI/Modal';
import {
  RotateCcw
} from "lucide-react";

export default function StudentDashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [showSets, setShowSets] = useState(false);
  const [attemptedExamId, setAttemptedExamId] = useState(null);
  const [is_exam_live, setIsExamLive] = useState(false);
  const [LiveExamBtnName, setLiveExamBtnName] = useState("Start Live Exam");
  const [liveExamId, setLiveExamId] = useState(null);
  const [LiveExamSet, setLiveExamSet] = useState(null);
  const [LiveExamLevel, SetLiveExamLevel] = useState(null);
  const [levelsetloading, setLevelsetLoading] = useState(true);
  const [levelwise_set, setLevelwiseSet] = useState([]);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userName =
    user?.name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    "User Name";

  const userImage = user?.image || user?.avatar || null;
  const userInitials =
    userName
      .split(" ")
      .filter(Boolean)
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const { data: upcomeingexam, examscheduleloading } = useFetchData(() =>
    examScheduleApi.getstudnetupcomeingexam(user.level, user.createdby)
  );



  useEffect(() => {
    const fetchLiveExam = async () => {
      try {
        const res = await examScheduleApi.getLiveExam(
          user.level,
          user.createdby
        );

        console.log("live exam", res?.data?.exam?.id)
        setIsExamLive(res?.data?.is_exam_live);
        setLiveExamId(res?.data?.exam?.id);
        setLiveExamBtnName(res?.data?.exam?.exam_title || "Start Live Exam");
        setLiveExamSet(res?.data?.exam?.paper_set);
        SetLiveExamLevel(res?.data?.exam?.exam_level);
        console.log("LIVE EXAM API RESPONSE 👉", res?.data?.exam?.exam_title);
        setexamloading(false);
      } catch (err) {
        console.error("Live exam fetch error ❌", err);
        setexamloading(false);
      }
    };

    if (user?.level && user?.createdby) {
      fetchLiveExam();
    }
  }, [user?.level, user?.createdby]);

  console.log("LiveExamSet", LiveExamSet)
  console.log("LiveExamLevel", LiveExamLevel)

  // const { data: levelwise_set, levelsetloading } = useFetchData(() =>
  //   questionApi.getset(user.level, user.createdby),
  // );

  // useEffect(() => {
  //   if (levelwise_set?.length > 0 && levelwise_set[0]?.level_name) {
  //     localStorage.setItem("Userlevl", levelwise_set[0].level_name);
  //   }
  // }, [levelwise_set]);


  /* ================= DATE HELPERS ================= */

  const isTodayOrFuture = (dateStr) => {
    const now = new Date();
    const examDate = new Date(dateStr);

    return examDate >= now;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateOnly = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime12hr = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    return new Date(dateTimeStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  /* ================= FILTERED EXAMS (🔥 FIX) ================= */
  // const isExamStillActiveOrFuture = (exam) => {
  //   const now = new Date();

  //   // exam date (YYYY-MM-DD)
  //   const examDate = new Date(exam.date);

  //   // build full end datetime
  //   const [hh, mm, ss] = exam.end_time.split(":").map(Number);
  //   const examEndDateTime = new Date(examDate);
  //   examEndDateTime.setHours(hh, mm, ss || 0, 0);

  //   return examEndDateTime > now;
  // };

  const isExamStillActiveOrFuture = (exam) => {
    const now = new Date();
    const end = new Date(exam.end_time);

    return end > now;
  };

  // const filteredUpcomingExams =
  //   upcomeingexam?.filter(
  //     exam =>
  //       isTodayOrFuture(exam.date) &&
  //       isExamStillActiveOrFuture(exam) &&
  //       exam.id !== attemptedExamId
  //   ) || [];

  const filteredUpcomingExams =
    upcomeingexam?.filter(
      (exam) => isExamStillActiveOrFuture(exam)
    ) || [];


  console.log("upcomeingexam", filteredUpcomingExams)
  /* ================= LIVE EXAM LOGIC ================= */

  const isLiveTime = (startTime, endTime) => {
    const now = new Date();

    const start = new Date(startTime);
    const end = new Date(endTime);

    return now >= start && now <= end;
  };

  // const userCityId = Number(user?.city_id);


  const liveExamData = filteredUpcomingExams.find(
    (exam) => isLiveTime(exam.start_time, exam.end_time)
  );
  // const liveExamData = filteredUpcomingExams.find(
  //   exam =>
  //     Number(exam?.Exam_for_city) === userCityId &&
  //     new Date(exam.date).toDateString() === new Date().toDateString() &&
  //     isLiveTime(exam.start_time, exam.end_time)
  // );

  const [isexam, setIsExam] = useState(false);
  const [examloading, setexamloading] = useState(true);

  useEffect(() => {
    const checkExam = async () => {
      if (!user?.id || !liveExamId) return;

      try {
        const res = await resultapi.examcheck(user.id, liveExamId);

        console.log("Is Exam Attempted?", res.data);

        setIsExam(Boolean(res.data.exam));
        setAttemptedExamId(res.data.exam_id || null);
      } catch (err) {
        console.error("Exam check failed", err);
        setIsExam(false);
        setAttemptedExamId(null);
      } finally {
        setexamloading(false);
      }
    };

    checkExam();
  }, [user?.id, liveExamId]);

  const handleSetSelect = (level, set) => {
    localStorage.setItem("paperset", set);
    localStorage.setItem("paperlevel", level);
    localStorage.setItem("examType", "mock");
    navigate("/exam-rule");
  };

  const liveExam = () => {
    localStorage.setItem("paperset", LiveExamSet);
    localStorage.setItem("paperlevel", LiveExamLevel);
    localStorage.setItem("Exam_Tittle", LiveExamBtnName);
    localStorage.setItem("examType", "live");
    localStorage.setItem('exam_id', liveExamId)
    navigate("/exam-rule");
  };


  // console.log("liveExamData", levelwise_set[0]?.level_name);
  // console.log("liveExamData",liveExamData)

  const hardReload = async () => {
    try {
      // setIsRefreshing(true);

      // 1. Clear local/session temporary app data if needed
      // Keep this only if you do NOT want to remove login/session data
      // localStorage.clear();
      // sessionStorage.clear();

      // If you want to preserve auth, remove only app cache keys manually instead
      // localStorage.removeItem("someOldCacheKey");

      // 2. Clear Cache Storage used by PWA/service worker
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }

      // 3. Unregister all service workers
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      // 4. Force browser to fetch fresh page from server
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("_ts", Date.now().toString());

      window.location.replace(currentUrl.toString());
    } catch (error) {
      console.error("Hard refresh failed:", error);
      window.location.reload();
    }
  };


  return (
    <>
      <div className="min-h-screen bg-slate-100 flex flex-col">

        {/* <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#E6F2FF] to-[#D9EBFF]"> */}

        {/* ================= APP BAR ================= */}
        <StudentAppBar
          title="Student Dashboard"
          subtitle="Train Your Brain Daily"
          userName={userName}
          userInitials={userInitials}
          userImage={userImage}
          onLogout={handleLogout}
        />

        {/* <div className="max-w-6xl mx-auto px-4 pb-10"> */}
        <div className="flex-1 w-full max-w-md mx-auto px-4 pb-28">


          {/* ================= UPCOMING EXAMS ================= */}
          <div className="mt-4">
            <div className="bg-white rounded-2xl shadow-sm p-3">
              <TopAutoCarousel
                items={
                  filteredUpcomingExams.length > 0
                    ? filteredUpcomingExams.map((exam) => (
                      <CreamCarouselCard
                        key={exam.id}
                        title={`Abacus Level ${exam.exam_level} Examination`}
                        subtitle={exam.exam_title}
                        examDate={exam.start_time}
                        startTime={exam.start_time}
                        endTime={exam.end_time}
                        image={examImg}
                        isExamLive={
                          is_exam_live &&
                          isLiveTime(exam.start_time, exam.end_time)
                        }
                      />
                    ))
                    : [
                      <CreamCarouselCard
                        key="no-exam"
                        title="No Upcoming Exams"
                        subtitle="Please check back later"
                        examDate="—"
                        startTime="—"
                        endTime="—"
                        image={examImg}
                        isExamLive={false}
                      />
                    ]
                }
              />
            </div>
          </div>

          <div className="w-full my-6">
            <button
              onClick={hardReload}
              className="flex items-center justify-center gap-2 px-4 py-2 my-2 rounded-xl transition-all duration-300 group w-full"
              style={{
                background: "rgba(180,180,180,0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <RotateCcw
                size={18}
                className="transition-transform duration-500 group-hover:rotate-180 text-gray-500"
              />
              <span className="text-sm font-medium text-gray-500">Refresh</span>
            </button>
          </div>



          {/* ================= ACTION SECTION ================= */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-800">
              Your Exams
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Test exams anytime • Live exams only during scheduled time
            </p>

            {/* {examloading ? <> */}
            {levelsetloading || examscheduleloading || examloading || levelwise_set === null ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : levelwise_set.length === 0 ? (
              <p className="text-sm text-center text-slate-500 mb-5">
                Sorry Practice Question Sets Not Available,<br />
                Please Contact Your Admin
              </p>
            ) : (
              <div className="space-y-3">
                {/* <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setModalOpen(true)}
                    className="w-full"
                  >
                    Start Test Exam
                  </Button> */}
                {!showSets && !liveExamData && !is_exam_live && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setModalOpen(true)}
                    className="w-full"
                  >
                    Start Test Exam
                  </Button>
                )}

                {is_exam_live && (
                  <div className="relative group w-full">
                    <Button
                      variant="green"
                      size="lg"
                      disabled={isexam}
                      onClick={liveExam}
                      className={`w-full ${!isexam ? "cursor-pointer" : "cursor-not-allowed"}`}

                    >
                      {LiveExamBtnName || "Start Live Exam"}
                    </Button>
                    {isexam && (
                      <div
                        className="
          absolute -top-10 left-1/2 -translate-x-1/2
          whitespace-nowrap
          bg-gray-800 text-white text-xs
          px-3 py-1 rounded-md
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          pointer-events-none
        "
                      >
                        Exam already submitted
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}


            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Select Practice Set"
              width="max-w-md"
            >
              {levelwise_set?.length === 0 ? (
                <p className="text-sm text-center text-slate-500 py-6">
                  Practice Question Sets Not Available.<br />
                  Please contact your admin.
                </p>
              ) : (
                <>
                  <p className="text-xs text-slate-500 mb-4">
                    Choose a set to start your test

                  </p>
                  <p><b>Level : </b>{levelwise_set[0]?.level_name}</p>
                  <br />
                  <div className="grid grid-cols-3 gap-3">
                    {levelwise_set?.map(item => (
                      <button
                        key={`${item.level}-${item.set_id}`}
                        onClick={() => handleSetSelect(item.level, item.set_id)}
                        className="
              h-12 rounded-xl font-semibold text-sm
              border border-blue-500 text-blue-600
              hover:bg-blue-600 hover:text-white
              active:scale-95 transition
            "
                      >
                        {/* {item.level}{item.set_id} */}
                        {item.set_id}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Button
                      variant="secondary"
                      onClick={() => setModalOpen(false)}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </Modal>

          </div>



        </div>
      </div>
    </>
  );
}
