import { FileQuestion, Inbox, Search, AlertCircle, UserX, FileX, Calendar, ClipboardList, Sparkles, Link2 } from 'lucide-react';

const icons = {
  inbox: Inbox,
  search: Search,
  error: AlertCircle,
  users: UserX,
  files: FileX,
  calendar: Calendar,
  clipboard: ClipboardList,
  link: Link2,
  default: FileQuestion,
};

/**
 * EmptyState - Komponen reusable untuk menampilkan state kosong dengan desain menarik
 *
 * @param {Object} props
 * @param {string} props.icon - Nama icon: 'inbox' | 'search' | 'error' | 'users' | 'files' | 'calendar' | 'clipboard'
 * @param {string} props.title - Judul utama
 * @param {string} props.description - Deskripsi detail
 * @param {React.ReactNode} props.action - Optional button atau action element
 * @param {string} props.variant - 'default' | 'primary' | 'secondary' | 'warning'
 * @param {string} props.size - 'sm' | 'md' | 'lg' - ukuran komponen
 */
export default function EmptyState({ icon = 'default', title, description, action, variant = 'default', size = 'md' }) {
  const Icon = icons[icon] || icons.default;

  const variantStyles = {
    default: {
      bg: 'bg-gradient-to-br from-neutral-50 to-neutral-100/50',
      iconBg: 'bg-gradient-to-br from-neutral-100 to-neutral-200/50',
      iconColor: 'text-neutral-400',
      titleColor: 'text-neutral-800',
      descColor: 'text-neutral-500',
      borderColor: 'border-neutral-200/80',
      accentColor: 'from-neutral-200/50 to-neutral-300/30',
    },
    primary: {
      bg: 'bg-gradient-to-br from-blue-50/80 to-indigo-50/50',
      iconBg: 'bg-gradient-to-br from-blue-100 to-indigo-100/80',
      iconColor: 'text-blue-500',
      titleColor: 'text-neutral-800',
      descColor: 'text-neutral-500',
      borderColor: 'border-blue-200/60',
      accentColor: 'from-blue-200/40 to-indigo-200/30',
    },
    secondary: {
      bg: 'bg-gradient-to-br from-purple-50/80 to-pink-50/50',
      iconBg: 'bg-gradient-to-br from-purple-100 to-pink-100/80',
      iconColor: 'text-purple-500',
      titleColor: 'text-neutral-800',
      descColor: 'text-neutral-500',
      borderColor: 'border-purple-200/60',
      accentColor: 'from-purple-200/40 to-pink-200/30',
    },
    warning: {
      bg: 'bg-gradient-to-br from-amber-50/80 to-orange-50/50',
      iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100/80',
      iconColor: 'text-amber-500',
      titleColor: 'text-neutral-800',
      descColor: 'text-neutral-500',
      borderColor: 'border-amber-200/60',
      accentColor: 'from-amber-200/40 to-orange-200/30',
    },
  };

  const sizeStyles = {
    sm: {
      container: 'px-4 py-8 sm:py-10',
      iconWrapper: 'h-12 w-12 sm:h-14 sm:w-14',
      iconSize: 'h-6 w-6 sm:h-7 sm:w-7',
      decorSize: 'h-20 w-20 sm:h-24 sm:w-24',
      title: 'text-sm sm:text-base',
      desc: 'text-xs sm:text-sm mb-4',
      sparkleSize: 'h-3 w-3',
    },
    md: {
      container: 'px-6 py-12 sm:py-16',
      iconWrapper: 'h-16 w-16 sm:h-20 sm:w-20',
      iconSize: 'h-8 w-8 sm:h-10 sm:w-10',
      decorSize: 'h-28 w-28 sm:h-32 sm:w-32',
      title: 'text-base sm:text-lg',
      desc: 'text-sm mb-5',
      sparkleSize: 'h-4 w-4',
    },
    lg: {
      container: 'px-8 py-16 sm:py-20',
      iconWrapper: 'h-20 w-20 sm:h-24 sm:w-24',
      iconSize: 'h-10 w-10 sm:h-12 sm:w-12',
      decorSize: 'h-36 w-36 sm:h-40 sm:w-40',
      title: 'text-lg sm:text-xl',
      desc: 'text-sm sm:text-base mb-6',
      sparkleSize: 'h-5 w-5',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;
  const sizes = sizeStyles[size] || sizeStyles.md;

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border ${style.borderColor} ${style.bg} ${sizes.container} text-center overflow-hidden`}>
      {/* Decorative background elements */}
      <div className={`absolute top-0 right-0 ${sizes.decorSize} bg-gradient-to-br ${style.accentColor} rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/4`} />
      <div className={`absolute bottom-0 left-0 ${sizes.decorSize} bg-gradient-to-tr ${style.accentColor} rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/4`} />

      {/* Decorative sparkles */}
      <div className="absolute top-4 right-6 sm:top-6 sm:right-8 opacity-40">
        <Sparkles className={`${sizes.sparkleSize} ${style.iconColor}`} />
      </div>
      <div className="absolute bottom-4 left-6 sm:bottom-6 sm:left-8 opacity-30">
        <Sparkles className={`${sizes.sparkleSize} ${style.iconColor}`} />
      </div>

      {/* Dotted pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Icon with animated ring */}
        <div className="relative mb-4 sm:mb-5">
          <div className={`absolute inset-0 ${style.iconBg} rounded-full animate-pulse opacity-50 scale-125`} />
          <div className={`relative flex ${sizes.iconWrapper} items-center justify-center rounded-full ${style.iconBg} shadow-sm ring-4 ring-white/80`}>
            <Icon className={`${sizes.iconSize} ${style.iconColor}`} strokeWidth={1.5} />
          </div>
        </div>

        {title && <h3 className={`mb-2 font-semibold ${sizes.title} ${style.titleColor} leading-tight`}>{title}</h3>}

        {description && <p className={`max-w-xs sm:max-w-sm ${sizes.desc} ${style.descColor} leading-relaxed`}>{description}</p>}

        {action && <div className="mt-2 animate-fade-in">{action}</div>}
      </div>
    </div>
  );
}
