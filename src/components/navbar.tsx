export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-6">
      <h2 className="text-2xl font-bold">BizFlow</h2>

      <div className="flex items-center gap-8">
        <a href="#">Features</a>
        <a href="#">Pricing</a>
        <a href="#">Contact</a>

        <button className="bg-white text-black px-4 py-2 rounded-lg">
          Get Started
        </button>
      </div>
    </nav>
  );
}