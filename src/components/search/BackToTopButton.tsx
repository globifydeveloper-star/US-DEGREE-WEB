const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

export default function BackToTopButton() {
  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 md:bottom-24 lg:bottom-6 right-6 z-50 w-12 h-12 rounded-full backdrop-blur-xl bg-[#878cd7]/10 border border-[#878cd7]/60 shadow-lg transition-all duration-300 text-gray-500 hover:text-white hover:bg-blue-600 hover:border-blue-500 hover:scale-110 active:scale-95"
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}
