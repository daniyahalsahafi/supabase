DROP POLICY IF EXISTS "public read clubs" ON public.clubs;
CREATE POLICY "public read tournament clubs" ON public.clubs FOR SELECT TO anon, authenticated USING (slot BETWEEN 1 AND 4);
DROP POLICY IF EXISTS "public read matches" ON public.matches;
CREATE POLICY "public read tournament matches" ON public.matches FOR SELECT TO anon, authenticated USING (match_number BETWEEN 1 AND 3);