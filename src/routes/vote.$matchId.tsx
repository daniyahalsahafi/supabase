import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/vote/$matchId")({
  component: VotingPage,
});

function VotingPage() {
  const { matchId } = Route.useParams();

  const [match, setMatch] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [controls, setControls] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"pre" | "post">("pre");
  const [selectedClub, setSelectedClub] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<any>(null);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: matchData, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (error || !matchData) {
        setMessage("المواجهة غير موجودة.");
        setLoading(false);
        return;
      }

      setMatch(matchData);

      const { data: controlData } = await supabase
        .from("voting_controls")
        .select("*")
        .eq("match_id", matchId)
        .single();

      setControls(controlData);

      if (matchData.club_a_id && matchData.club_b_id) {
        const { data: clubsData } = await supabase
          .from("clubs")
          .select("*")
          .in("id", [matchData.club_a_id, matchData.club_b_id]);

        setClubs(clubsData || []);
      }

      setLoading(false);
    }

    loadData();
  }, [matchId]);

  useEffect(() => {
    setSelectedClub("");
    setMessage("");
    setResults(null);

    const saved = localStorage.getItem(`voted-${matchId}-${phase}`);
    setVoted(saved === "true");
  }, [matchId, phase]);

  async function submitVote() {
    if (!selectedClub || sending) return;

    setSending(true);
    setMessage("");

    try {
      const tokenKey = `voter-token-${matchId}-${phase}`;
      let voterToken = localStorage.getItem(tokenKey);

      if (!voterToken) {
        voterToken = crypto.randomUUID() + crypto.randomUUID();
        localStorage.setItem(tokenKey, voterToken);
      }

      const { data, error } = await supabase.functions.invoke(
        "cast-vote",
        {
          body: {
            matchId,
            phase,
            choiceClubId: selectedClub,
            voterToken,
          },
        }
      );

      if (error) {
        let errorMessage = "تعذر إرسال صوتك. حاولي مرة أخرى.";
        try {
          const details = await error.context.json();
          errorMessage = details.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      if (!data?.success) {
        throw new Error(data?.error || "تعذر تسجيل التصويت.");
      }

      localStorage.setItem(`voted-${matchId}-${phase}`, "true");
      setVoted(true);
      setResults(data.results || null);
      setMessage("تم تسجيل صوتك بنجاح! شكرًا لمشاركتك 🎉");
    } catch (error: any) {
      setMessage(error.message || "حدث خطأ أثناء التصويت.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <main dir="rtl" className="p-10 text-center">جاري التحميل...</main>;
  }

  if (!match || !controls) {
    return <main dir="rtl" className="p-10 text-center">تعذر تحميل المواجهة.</main>;
  }

  const isOpen = phase === "pre"
    ? controls.pre_open
    : controls.post_open;

  return (
    <main dir="rtl" className="min-h-screen bg-[#FCF8E9] px-5 py-12">
      <div className="mx-auto max-w-3xl text-center">

        <p className="mb-3 text-sm font-semibold text-[#80673E]">
          نادي ريادة الأعمال – جامعة الملك عبدالعزيز
        </p>

        <h1 className="mb-3 text-4xl font-bold text-[#395642]">
          روّاد المناظرة
        </h1>

        <p className="mb-8 text-gray-600">
          صوتك يساهم في قياس آراء الجمهور
        </p>

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            المواجهة {match.match_number}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {clubs.map((club) => (
              <button
                key={club.id}
                onClick={() => {
                  if (isOpen && !voted) setSelectedClub(club.id);
                }}
                disabled={!isOpen || voted}
                className={`rounded-xl border-2 p-5 transition ${
                  selectedClub === club.id
                    ? "border-[#80673E] bg-[#FCF8E9]"
                    : "border-gray-100 bg-white"
                }`}
              >
                {club.logo_url && (
                  <img
                    src={club.logo_url}
                    alt=""
                    className="mx-auto mb-3 h-16 w-16 object-contain"
                  />
                )}
                <p className="font-bold text-gray-800">{club.name}</p>
                {selectedClub === club.id && (
                  <p className="mt-2 text-sm text-[#80673E]">
                    تم الاختيار ✓
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => setPhase("pre")}
            className={`rounded-xl p-4 font-bold ${
              phase === "pre"
                ? "bg-[#395642] text-white"
                : "bg-white text-gray-600"
            }`}
          >
            التصويت القبلي
          </button>

          <button
            onClick={() => setPhase("post")}
            className={`rounded-xl p-4 font-bold ${
              phase === "post"
                ? "bg-[#395642] text-white"
                : "bg-white text-gray-600"
            }`}
          >
            التصويت البعدي
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <span className={`rounded-full px-4 py-2 text-sm font-bold ${
              isOpen
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}>
              {isOpen ? "التصويت مفتوح" : "التصويت مغلق"}
            </span>
          </div>

          {!isOpen ? (
            <p className="text-gray-500">
              التصويت غير متاح حاليًا.
            </p>
          ) : voted ? (
            <p className="font-semibold text-green-700">
              سبق تسجيل صوتك في هذه المرحلة.
            </p>
          ) : (
            <>
              <p className="mb-5 text-gray-600">
                اختاري النادي الذي ترغبين بالتصويت له.
              </p>

              <button
                onClick={submitVote}
                disabled={!selectedClub || sending || clubs.length !== 2}
                className="w-full rounded-xl bg-[#80673E] px-6 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? "جاري تسجيل صوتك..." : "إرسال التصويت"}
              </button>
            </>
          )}

          {message && (
            <p className="mt-5 font-semibold text-[#395642]">
              {message}
            </p>
          )}

          {results && (
            <div className="mt-6 rounded-xl bg-[#FCF8E9] p-4 text-right">
              <h3 className="mb-3 font-bold">نتائج الأصوات المسجلة</h3>
              {clubs.map((club) => (
                <p key={club.id} className="mb-2 text-gray-700">
                  {club.name}: {
                    club.id === match.club_a_id
                      ? results.clubA
                      : results.clubB
                  } صوت
                </p>
              ))}
              <p className="mt-3 font-bold">
                إجمالي الأصوات: {results.total}
              </p>
            </div>
          )}
        </div>

        <p className="mt-8 text-sm text-gray-500">
          شكرًا لمشاركتكم في روّاد المناظرة!
        </p>
      </div>
    </main>
  );
}
