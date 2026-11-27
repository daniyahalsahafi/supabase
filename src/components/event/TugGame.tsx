import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Hand, Bot, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { computerPull, opponent, pullPosition, type Difficulty } from '@/lib/platform-rules';
export function TugGame() {
  const [level,setLevel]=useState<Difficulty>('medium');
  const [position,setPosition]=useState(0);
  const [state,setState]=useState<'ready'|'playing'|'won'|'lost'>('ready');
  const lastPull=useRef(0);
  useEffect(()=>{
    if(state!=='playing')return;
    let timer:ReturnType<typeof setTimeout>;
    const tick=()=>{timer=setTimeout(()=>{setPosition(p=>pullPosition(p,-computerPull(level,Math.random())));tick();},opponent[level].delay*(0.65+Math.random()*0.7));};
    tick(); return ()=>clearTimeout(timer);
  },[state,level]);
  useEffect(()=>{if(state==='playing' && Math.abs(position)>=100)setState(position>0?'won':'lost');},[position,state]);
  const start=()=>{lastPull.current=0;setPosition(0);setState('playing');};
  const pull=()=>{const now=performance.now();if(state!=='playing'||now-lastPull.current<100)return;lastPull.current=now;setPosition(p=>pullPosition(p,8));};
  return (
  <div className="py-8 text-center">

    {/* مستوى الصعوبة */}
    <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
      <label htmlFor="difficulty" className="text-sm">
        مستوى الصعوبة
      </label>

      <select
        id="difficulty"
        value={level}
        disabled={state === 'playing'}
        onChange={(e) => setLevel(e.target.value as Difficulty)}
        className="rounded-md border bg-background px-3 py-2"
      >
        <option value="easy">سهل</option>
        <option value="medium">متوسط</option>
        <option value="hard">صعب</option>
      </select>
    </div>
{/* اللاعب والكمبيوتر */}
<div className="mx-auto flex max-w-2xl items-end justify-between px-4">

  {/* أنت - يسار */}
  <div className="text-center">
    <UserRound className="mx-auto mb-2 h-12 w-12 text-primary" />
    أنت
  </div>

  {/* الكمبيوتر - يمين */}
  <div className="text-center">
    <Bot className="mx-auto mb-2 h-12 w-12 text-accent" />
    الكمبيوتر
  </div>

</div>
    {/* ساحة شد الحبل */}
    <div
      className="tug-field mx-auto my-6 max-w-2xl"
      aria-label="ساحة شد الحبل"
    >
      <div className="tug-center" />

      <div
        className="tug-rope"
        style={{
left: `calc(10% + ${position * 0.3}%)`,        }}
      >
        <span className="tug-knot" />
      </div>

      <span className="tug-boundary tug-boundary-player" />
      <span className="tug-boundary tug-boundary-computer" />
    </div>

    {/* حالة الجولة */}
    <div role="status" className="mb-5 min-h-8 font-semibold">
      {state === 'won'
        ? '🎉 فزت بالجولة!'
        : state === 'lost'
        ? 'فاز الكمبيوتر بهذه الجولة'
        : state === 'ready'
        ? 'جولة جديدة'
        : position > 5
        ? 'أنت متقدم'
        : position < -5
        ? 'الكمبيوتر متقدم'
        : 'القوة متوازنة'}
    </div>

    {/* الأزرار */}
    <div className="flex flex-wrap justify-center gap-3">
      {state === 'ready' ? (
        <Button size="lg" onClick={start}>
          <Play />
          ابدأ اللعبة
        </Button>
      ) : (
        <Button size="lg" variant="outline" onClick={start}>
          <RotateCcw />
          إعادة الجولة
        </Button>
      )}

      <Button
        size="lg"
        onClick={pull}
        disabled={state !== 'playing'}
        className="touch-manipulation select-none bg-accent text-accent-foreground"
      >
        <Hand />
        اسحب!
      </Button>
    </div>
  </div>
);

}
