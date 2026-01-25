"use client"

export function Footer() {
  return (
    <footer className="bg-black text-white py-12 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">

          {/* Left: Contact Info (Branding removed) */}
          <div className="flex flex-col items-center md:items-start space-y-4 text-center md:text-left">
            <div className="space-y-1.5 text-sm text-zinc-400">
              <a
                href="tel:6418624429"
                className="block text-white font-bold hover:text-red-500 transition-colors text-lg"
              >
                (641) 862-4429
              </a>
              <p className="font-medium">M-F 10:00 AM - 5:00 PM</p>
              <p className="font-medium text-zinc-500">Saturday by Appointment</p>
            </div>
          </div>

          {/* Middle: Map & Location */}
          <div className="flex flex-col items-center w-full">
            <div className="relative w-full max-w-[300px] h-32 rounded-xl overflow-hidden bg-zinc-900/50 border border-zinc-800 group transition-all hover:border-zinc-600">
              {/* Fallback pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>

              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3012.1!2d-93.261!3d41.089!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87e931995f4fe7dd%3A0xbacec924365e8411!2sRDM+MOTORS+LLC!5e0!3m2!1sen!2sus!4v1706132742964!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="RDM Motors Location"
                className="relative z-10 w-full h-full opacity-0 transition-opacity duration-1000 ease-in-out onload-fade-in"
                onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
              ></iframe>

              <a
                href="https://www.google.com/maps/place/RDM+MOTORS+LLC/@41.089704,-93.2588237,17z/data=!3m1!4b1!4m6!3m5!1s0x87e931995f4fe7dd:0xbacec924365e8411!8m2!3d41.089704!4d-93.2588237!16s%2Fg%2F11trn0qvkj"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-20"
                aria-label="Open in Google Maps"
              ></a>
            </div>
            <div className="mt-4 text-center">
              <p className="text-white font-bold text-sm tracking-tight">205 Williamson Ave</p>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide">Williamson, IA 50272</p>
            </div>
          </div>

          {/* Right: Est & Dealer # */}
          <div className="flex flex-col items-center md:items-end gap-6 text-center md:text-right">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-1">Established</p>
              <p className="text-2xl font-bold text-white leading-none">2020</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-1">Dealer Number</p>
              <p className="text-base font-medium text-zinc-400">#5679</p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
