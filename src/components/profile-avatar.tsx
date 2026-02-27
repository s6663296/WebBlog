import type { CSSProperties } from "react";
import Image from "next/image";

type ProfileAvatarProps = {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
};

function getInitial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "U";
}

export function ProfileAvatar({ name, avatarUrl, size = "md" }: ProfileAvatarProps) {
  const sizeClass =
    size === "sm"
      ? "h-16 w-16 rounded-xl"
      : size === "lg"
        ? "h-32 w-32 rounded-2xl md:h-40 md:w-40 md:rounded-3xl"
        : "h-20 w-20 rounded-2xl";

  const containerClass = `${sizeClass} relative shrink-0 overflow-hidden border border-cyan-200/30 bg-slate-900/70 shadow-[0_14px_28px_rgba(34,211,238,0.15)]`;

  if (avatarUrl?.startsWith("/")) {
    return (
      <div className={containerClass}>
        <Image src={avatarUrl} alt={`${name} avatar`} fill sizes="(max-width: 768px) 128px, 160px" className="object-cover" />
      </div>
    );
  }

  if (avatarUrl) {
    const style: CSSProperties = {
      backgroundImage: `url("${avatarUrl.replace(/"/g, "%22")}")`,
    };

    return <div className={`${containerClass} bg-cover bg-center`} role="img" aria-label={`${name} avatar`} style={style} />;
  }

  return (
    <div className={`${containerClass} flex items-center justify-center text-xl font-semibold text-cyan-100`}>
      {getInitial(name)}
    </div>
  );
}
