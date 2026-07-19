import React, { useState } from 'react';
import StudentAppBar from './StudentAppBar';
import Button from '../../UI/Button';
import Modal from '../../UI/Modal';
import { useNavigate } from 'react-router-dom';
import examScheduleApi from '../../api/examScheduleApi';
import setsApi from '../../api/SetsApi';
import { useFetchData } from '../../hooks/useFetchData';
import TopAutoCarousel from './LightDashboardCard';
import CreamCarouselCard from './CreamCarouselCard';
import examImg from '../../assets/exam.png';

export default function StudentDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userName =
    user?.name ||
    `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
    'User Name';

  const userImage = user?.image || user?.avatar || null;
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // API returns: { success, message, data: [ { id, exam_title, start_datetime, end_datetime, exam_level, exam_set, remark: "LIVE" | "UPCOMING", ... } ] }
  const { data: examResponse, loading: examLoading } = useFetchData(() =>
    examScheduleApi.getstudnetupcomeingexam(user.level, user.createdby)
  );

  // Defensive: handle either { data: [...] } or a raw array, depending on hook/api shape
  const exams = Array.isArray(examResponse)
    ? examResponse
    : examResponse?.data || [];

  const liveExam = exams.find((exam) => exam.remark === 'LIVE');

  const startLiveExam = () => {
    localStorage.setItem('exam_id', liveExam.id);
    localStorage.setItem('paperset', liveExam.exam_set);
    localStorage.setItem('paperlevel', liveExam.exam_level);
    localStorage.setItem('Exam_Tittle', liveExam.exam_title);
    localStorage.setItem('examType', 'live');
    navigate('/exam-rule');
  };

  // ================= PRACTICE TEST (SET SELECTION) =================
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [sets, setSets] = useState([]);
  const [setsLoading, setSetsLoading] = useState(false);

  const openPracticeModal = async () => {
    setPracticeModalOpen(true);
    setSetsLoading(true);
    try {
      const res = await setsApi.getStudentSets();
      setSets(res?.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch sets', err);
      setSets([]);
    } finally {
      setSetsLoading(false);
    }
  };

  const startPracticeTest = (set) => {
    localStorage.setItem('paperset', set.id);
    localStorage.setItem('paperlevel', user.level);
    localStorage.setItem('examType', 'mock');
    navigate('/exam-rule');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <StudentAppBar
        title="Student Dashboard"
        subtitle="Train Your Brain Daily"
        userName={userName}
        userInitials={userInitials}
        userImage={userImage}
        onLogout={handleLogout}
      />

      <div className="flex-1 w-full max-w-md mx-auto px-4 pb-28">
        {/* ================= UPCOMING EXAMS ================= */}
        <div className="mt-4">
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <TopAutoCarousel
              items={
                exams.length > 0
                  ? exams.map((exam) => (
                      <CreamCarouselCard
                        key={exam.id}
                        title={`Abacus Level ${exam.exam_level} Examination`}
                        subtitle={exam.exam_title}
                        examDate={exam.start_datetime}
                        startTime={exam.start_datetime}
                        endTime={exam.end_datetime}
                        image={examImg}
                        isExamLive={exam.remark === 'LIVE'}
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
                      />,
                    ]
              }
            />
          </div>
        </div>

        {/* ================= LIVE EXAM ================= */}
        {!examLoading && liveExam && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-800">Live Exam</h3>
            <p className="text-xs text-slate-500 mb-4">
              This exam is live right now — start whenever you're ready.
            </p>
            <Button variant="green" size="lg" onClick={startLiveExam} className="w-full">
              {liveExam.exam_title}
            </Button>
          </div>
        )}

        {/* ================= PRACTICE TEST ================= */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800">Practice Test</h3>
          <p className="text-xs text-slate-500 mb-4">
            Pick a set and practice anytime.
          </p>
          <Button variant="primary" size="lg" onClick={openPracticeModal} className="w-full">
            Start Practice Test
          </Button>
        </div>

        <Modal
          open={practiceModalOpen}
          onClose={() => setPracticeModalOpen(false)}
          title="Select Practice Set"
          width="max-w-md"
        >
          {setsLoading ? (
            <p className="text-sm text-center text-slate-500 py-6">Loading sets…</p>
          ) : sets.length === 0 ? (
            <p className="text-sm text-center text-slate-500 py-6">
              No practice sets available.
              <br />
              Please contact your admin.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {sets.map((set) => (
                <button
                  key={set.id}
                  onClick={() => startPracticeTest(set)}
                  className="
                    h-12 rounded-xl font-semibold text-sm
                    border border-blue-500 text-blue-600
                    hover:bg-blue-600 hover:text-white
                    active:scale-95 transition
                  "
                >
                  {set.set_name}
                </button>
              ))}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}