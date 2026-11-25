import previousEditionImage from "@/assets/event-2025.png.asset.json";

export function PreviousEdition() {
  return (
    <section aria-labelledby="previous-edition-title" className="mt-20 bg-gold-soft">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-[2fr_3fr] md:gap-12 md:py-16">
        <div className="text-start">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-sage" aria-hidden="true" />
            <span className="text-sm font-semibold text-secondary-foreground">من هنا بدأت الحكاية</span>
            <span dir="ltr" className="rounded-md bg-accent px-3 py-1 font-display text-lg font-bold text-accent-foreground">2025</span>
          </div>
          <h2 id="previous-edition-title" className="text-3xl font-semibold leading-relaxed md:text-4xl">
            لأن بعض التجارب<br className="hidden md:block" /> تستحق أن تتكرر!
          </h2>
          <p className="mt-6 text-base leading-8 text-foreground">
            في عام 2025، كانت البداية بتجربة جمعتنا حول الشغف والمعرفة وروح التنافس. ولأنكم أحببتموها، قررنا أن نعود بها إليكم من جديد، بحلّة متجددة، وأفكار أجمل، وتجربة تليق بكم وبطموحاتكم.
          </p>
        </div>
        <img
          src={previousEditionImage.url}
          alt="صورة جماعية للمشاركين في النسخة السابقة من فعالية نادي ريادة الأعمال لعام 2025"
          width={1112}
          height={742}
          loading="lazy"
          className="block h-auto w-full rounded-lg"
        />
      </div>
    </section>
  );
}