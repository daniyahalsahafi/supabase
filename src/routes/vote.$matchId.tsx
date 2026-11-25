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
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVotingData() {
      setLoading(true);
      setError("");

      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      
      if (matchError || !matchData) {
        setError("المواجهة غير موجودة.");
        setLoading(false);
        return;
      }

      setMatch(matchData);

      const { data: controlData, error: controlError } = await supabase
        .from("voting_controls")
        .select("*")
        .eq("match_id", matchId)
        .single();

      if (controlError) {
        setError("تعذر تحميل حالة التصويت.");
        setLoading(false);
        return;
      }

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

    loadVotingData();
  }, [matchId]);

  if (loading) {
    return <main dir="rtl" className="p-10 text-center">جاري تحميل التصويت...</main>;
  }

  if (error || !match || !controls) {
    return <main dir="rtl" className="p-10 text-center">{error || "تعذر تحميل الصفحة."}</main>;
  }

  const phases = [
    { key: "pre_open", label: "التصويت القبلي" },
    { key: "post_open", label: "التصويت البعدي" },
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-[#FCF8E9] px-5 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold text-[#80673E]">
          نادي ريادة الأعمال – جامعة الملك عبدالعزيز
        </p>

        <h1 className="mb-3 text-3xl font-bold text-[#395642]">
          روّاد المناظرة
        </h1>

        <p className="mb-10 text-gray-600">
          شاركنا رأيك في هذه المواجهة
        </p>

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-800">
            المواجهة {match.match_number}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {clubs.map((club) => (
              <div key={club.id} className="rounded-xl border p-5">
                {club.logo_url && (
                  <img
                    src={club.logo_url}
                    alt=""
                    className="mx-auto mb-3 h-16 w-16 object-contain"
                  />
                )}
                <p className="font-bold text-gray-800">{club.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {phases.map((phase) => {
            const isOpen = controls[phase.key];

            return (
              <div
                key={phase.key}
                className="rounded-xl bg-white p-6 text-right shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-gray-800">{phase.label}</h3>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      isOpen
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isOpen ? "التصويت مفتوح" : "التصويت مغلق"}
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-500">
                  {isOpen
                    ? "التصويت متاح حاليًا."
                    : "سيتم فتح التصويت من قبل المنظمين."}
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-gray-500">
          شكرًا لمشاركتكم!
        </p>
      </div>
    </main>
  );
}
