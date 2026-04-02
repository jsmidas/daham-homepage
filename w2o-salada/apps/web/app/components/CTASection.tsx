import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 bg-brand-dark">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
          건강한 내일을 위한<br />첫 걸음을 시작하세요
        </h2>
        <p className="text-brand-amber mt-4 text-lg">
          지금 가입하면 첫 주 30% 할인!
        </p>
        <Link
          href="/#subscribe"
          className="inline-block mt-8 px-10 py-4 bg-brand-amber text-white rounded-full font-bold text-lg hover:opacity-90 transition"
        >
          무료로 시작하기
        </Link>
      </div>
    </section>
  );
}
