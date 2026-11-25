import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [clubs, setClubs] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    setLoading(true);

    const { data } = await supabase.auth.getUser();
    const currentUser = data.user;

    if (!currentUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    setUser(currentUser);

    const { data: isAdmin, error: roleError } = await supabase.rpc(
      "has_role",
      {
        _role: "admin",
        _user_id: currentUser.id,
      }
    );

    if (roleError || !isAdmin) {
      setAuthorized(false);
      setError("ليس لديك صلاحية الدخول إلى لوحة التحكم.");
      setLoading(false);
      return;
    }

    setAuthorized(true);
    await loadData();
    setLoading(false);
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      setSaving(false);
      return;
    }

    await checkUser();
    setSaving(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setAuthorized(false);
  }

  async function loadData() {
    const [clubsResult, matchesResult, settingsResult] =
      await Promise.all([
        supabase.from("clubs").select("*").order("slot"),
        supabase.from("matches").select("*").order("match_number"),
        supabase.from("event_settings").select("*").eq("id", 1).single(),
      ]);

    if (clubsResult.data) setClubs(clubsResult.data);
    if (matchesResult.data) setMatches(matchesResult.data);
    if (settingsResult.data) setSettings(settingsResult.data);

    if (clubsResult.error || matchesResult.error || settingsResult.error) {
      setError("تعذر تحميل بعض البيانات.");
    }
  }

  async function saveClub(club: any) {
    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("clubs")
      .update({
        name: club.name,
        university: club.university,
        position: club.position,
        short_description: club.short_description,
        logo_url: club.logo_url,
        representatives: club.representatives,
      })
      .eq("id", club.id);

    if (error) setError("تعذر حفظ بيانات النادي: " + error.message);
    else await loadData();

    setSaving(false);
  }

  async function saveMatch(match: any) {
    const scoreA = Number(match.score_a);
    const scoreB = Number(match.score_b);

    if (
      !Number.isFinite(scoreA) ||
      !Number.isFinite(scoreB) ||
      scoreA === scoreB
    ) {
      setError("أدخلي نتيجتين صحيحتين، ولا يمكن اعتماد التعادل.");
      return;
    }

    if (!match.club_a_id || !match.club_b_id) {
      setError("لم يتم تحديد طرفي هذه المواجهة بعد.");
      return;
    }

    const winnerId =
      scoreA > scoreB ? match.club_a_id : match.club_b_id;

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("matches")
      .update({
        score_a: scoreA,
        score_b: scoreB,
        winner_id: winnerId,
        confirmed_at: new Date().toISOString(),
        confirmed_by: user.id,
      })
      .eq("id", match.id);

    if (error) {
      setError("تعذر اعتماد النتيجة: " + error.message);
    } else {
      await loadData();
    }

    setSaving(false);
  }

  async function saveSettings() {
    if (!settings) return;

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("event_settings")
      .update({
        date_label: settings.date_label,
        time_label: settings.time_label,
        venue: settings.venue,
        account_handle: settings.account_handle,
        event_at: settings.event_at,
      })
      .eq("id", 1);

    if (error) setError("تعذر حفظ الإعدادات: " + error.message);

    setSaving(false);
  }

  if (loading) {
    return (
      <main dir="rtl" className="min-h-screen grid place-items-center">
        جارٍ التحميل...
      </main>
    );
  }

  if (!user || !authorized) {
    return (
      <main
        dir="rtl"
        className="min-h-screen grid place-items-center bg-[#faf9f6] p-6"
      >
        <form
          onSubmit={login}
          className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-sm"
        >
          <h1 className="text-2xl font-bold text-center text-[#49315f]">
            لوحة تحكم روّاد المناظرة
          </h1>

          <p className="text-center text-gray-500">
            تسجيل دخول المنظمين
          </p>

          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border p-3"
          />

          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border p-3"
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            disabled={saving}
            className="w-full rounded-lg bg-[#49315f] p-3 font-bold text-white disabled:opacity-50"
          >
            {saving ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#faf9f6] p-5 md:p-10"
    >
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#49315f]">
              لوحة التحكم
            </h1>
            <p className="mt-2 text-gray-500">
              إدارة فعالية روّاد المناظرة
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border px-5 py-2"
          >
            تسجيل الخروج
          </button>
        </header>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <section className="space-y-5">
          <h2 className="text-xl font-bold text-[#49315f]">
            إدارة الأندية
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="space-y-3 rounded-xl bg-white p-5 shadow-sm"
              >
                <h3 className="font-bold">
                  النادي {club.slot}
                </h3>

                <label className="block text-sm">اسم النادي</label>
                <input
                  value={club.name ?? ""}
                  onChange={(e) =>
                    setClubs((old) =>
                      old.map((c) =>
                        c.id === club.id
                          ? { ...c, name: e.target.value }
                          : c
                      )
                    )
                  }
                  className="w-full rounded-lg border p-2"
                />

                <label className="block text-sm">الجامعة</label>
                <input
                  value={club.university ?? ""}
                  onChange={(e) =>
                    setClubs((old) =>
                      old.map((c) =>
                        c.id === club.id
                          ? { ...c, university: e.target.value }
                          : c
                      )
                    )
                  }
                  className="w-full rounded-lg border p-2"
                />

                <label className="block text-sm">الوصف</label>
                <textarea
                  value={club.short_description ?? ""}
                  onChange={(e) =>
                    setClubs((old) =>
                      old.map((c) =>
                        c.id === club.id
                          ? { ...c, short_description: e.target.value }
                          : c
                      )
                    )
                  }
                  className="w-full rounded-lg border p-2"
                />

                <label className="block text-sm">رابط الشعار</label>
                <input
                  value={club.logo_url ?? ""}
                  onChange={(e) =>
                    setClubs((old) =>
                      old.map((c) =>
                        c.id === club.id
                          ? { ...c, logo_url: e.target.value }
                          : c
                      )
                    )
                  }
                  className="w-full rounded-lg border p-2"
                />

                <button
                  onClick={() => saveClub(club)}
                  disabled={saving}
                  className="w-full rounded-lg bg-[#49315f] p-3 text-white"
                >
                  حفظ بيانات النادي
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-xl font-bold text-[#49315f]">
            إدارة المواجهات والنتائج
          </h2>

          {matches.map((match) => {
            const clubA = clubs.find(
              (c) => c.id === match.club_a_id
            );
            const clubB = clubs.find(
              (c) => c.id === match.club_b_id
            );

            return (
              <div
                key={match.id}
                className="space-y-4 rounded-xl bg-white p-5 shadow-sm"
              >
                <h3 className="font-bold">
                  {match.round} – المواجهة {match.match_number}
                </h3>

                <p className="text-sm text-gray-500">
                  {clubA?.name ?? "بانتظار المتأهل"} ضد{" "}
                  {clubB?.name ?? "بانتظار المتأهل"}
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-sm">
                      نتيجة الطرف الأول
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={match.score_a ?? ""}
                      onChange={(e) =>
                        setMatches((old) =>
                          old.map((m) =>
                            m.id === match.id
                              ? { ...m, score_a: e.target.value }
                              : m
                          )
                        )
                      }
                      className="mt-2 w-full rounded-lg border p-3"
                    />
                  </div>

                  <span className="pt-6">-</span>

                  <div className="flex-1">
                    <label className="text-sm">
                      نتيجة الطرف الثاني
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={match.score_b ?? ""}
                      onChange={(e) =>
                        setMatches((old) =>
                          old.map((m) =>
                            m.id === match.id
                              ? { ...m, score_b: e.target.value }
                              : m
                          )
                        )
                      }
                      className="mt-2 w-full rounded-lg border p-3"
                    />
                  </div>
                </div>

                <button
                  onClick={() => saveMatch(match)}
                  disabled={saving}
                  className="w-full rounded-lg bg-[#b98b42] p-3 font-bold text-white"
                >
                  اعتماد النتيجة
                </button>

                {match.confirmed_at && (
                  <p className="text-sm text-green-700">
                    تم اعتماد النتيجة
                  </p>
                )}
              </div>
            );
          })}
        </section>

        {settings && (
          <section className="space-y-5 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#49315f]">
              إعدادات الفعالية
            </h2>

            {[
              ["date_label", "تاريخ الفعالية"],
              ["time_label", "وقت الفعالية"],
              ["venue", "الموقع"],
              ["account_handle", "الحساب الرسمي"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="mb-2 block text-sm">
                  {label}
                </label>
                <input
                  value={settings[key] ?? ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      [key]: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border p-3"
                />
              </div>
            ))}

            <button
              onClick={saveSettings}
              disabled={saving}
              className="w-full rounded-lg bg-[#49315f] p-3 font-bold text-white"
            >
              حفظ إعدادات الفعالية
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
