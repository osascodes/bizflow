import Navbar from "@/components/navbar"; 
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen flex items-center justify-center px-6">
        <section className="max-w-4xl text-center">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Scale Your Business With
            <span className="block">BizFlow</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600">
            Streamline your workflow, manage projects, and grow faster with one powerful platform.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link  href="/register" className="bg-black text-white px-6 py-3 rounded-lg">
              Get Started
            </Link>

            <Link href="/login" className="border px-6 py-3 rounded-lg">
              Learn More
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}