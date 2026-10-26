import { TAB_CONFIGS, type CreditType, type TabConfig } from "@/lib/tabs";

interface TabBarProps {
  active: CreditType;
  onChange: (id: CreditType) => void;
}

const getActiveConfig = (id: CreditType): TabConfig =>
  TAB_CONFIGS.find((t) => t.id === id) ?? TAB_CONFIGS[0];

export default function TabBar({ active, onChange }: TabBarProps) {
  const activeConfig = getActiveConfig(active);

  return (
    <div className="flex gap-2 rounded-2xl bg-slate-100 p-1.5 shadow-inner sm:gap-2.5">
      {TAB_CONFIGS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={[
              "group relative flex flex-1 items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm font-semibold transition-all duration-300 sm:px-4 sm:text-base",
              isActive
                ? `bg-gradient-to-br ${activeConfig.accentFrom} ${activeConfig.accentTo} text-white shadow-lg ring-1 ${activeConfig.accentRing}`
                : "text-slate-500 hover:bg-white hover:text-slate-700",
            ].join(" ")}
          >
            <Icon
              className={[
                "h-4 w-4 shrink-0 transition-transform duration-300 sm:h-5 sm:w-5",
                isActive ? "scale-110" : "group-hover:scale-110",
              ].join(" ")}
            />
            <span className="hidden whitespace-nowrap xs:block sm:inline">
              {tab.label}
            </span>
            <span className="whitespace-nowrap xs:hidden sm:hidden">
              {tab.label.replace("Kredit ", "")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
