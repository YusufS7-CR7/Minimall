export default function FloatingButtons() {
  return (
    <div className="fixed bottom-[76px] md:bottom-6 right-4 md:right-6 flex flex-col gap-3 z-50">
      <a
        href="tel:+998970363636"
        aria-label="Позвонить нам: +998 (97) 036 36 36"
        title="+998 (97) 036 36 36"
        className="rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all text-white bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 hover:scale-110"
        style={{ width: 52, height: 52 }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </a>
      <a
        href="https://t.me/minimall_uzb"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Написать в Telegram (@minimall_uzb)"
        title="Написать в Telegram (@minimall_uzb)"
        className="rounded-full flex items-center justify-center shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 transition-all text-white bg-gradient-to-br from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 hover:scale-110"
        style={{ width: 52, height: 52 }}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.04 17.68l-.37 5.23 2.52-2.44 2.95 2.17c.33.24.79.1.95-.28l5.46-13.06c.2-.48-.28-.96-.77-.77L2.23 14.36c-.52.2-.51.93.01 1.12l3.97 1.37 9.29-5.85c.21-.13.45.15.27.32z" />
        </svg>
      </a>
    </div>
  );
}
