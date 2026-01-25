"use client"

import { MapPin, Phone, Clock } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-black text-white py-8 border-t border-neutral-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between gap-8 items-start lg:items-center">

          {/* Left: Contact Info */}
          <div className="flex flex-wrap gap-10 items-center">
            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 shadow-lg">
                <Phone className="h-4 w-4 text-red-600" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em]">Contact Us</p>
                <a href="tel:6418624429" className="text-sm font-black text-white hover:text-red-500 transition-colors tracking-tight">
                  (641) 862-4429
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-center gap-4">
              <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 shadow-lg">
                <Clock className="h-4 w-4 text-red-600" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em]">Open Hours</p>
                <p className="text-sm font-black text-white tracking-tight uppercase">M-F 10-5, SAT BY APPT</p>
              </div>
            </div>
          </div>

          {/* Right: Address next to Map */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 bg-neutral-900/40 p-4 rounded-2xl border border-neutral-800/50 backdrop-blur-sm w-full lg:w-auto">
            <div className="text-left space-y-0.5">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em]">Our Location</p>
              <p className="text-sm font-black text-white tracking-tight">205 Williamson Ave</p>
              <p className="text-[11px] text-neutral-300 font-medium">Williamson, IA 50272</p>
            </div>

            <div className="w-full sm:w-36 h-24 sm:h-16 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl group relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3012.1!2d-93.261!3d41.089!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87e931995f4fe7dd%3A0xbacec924365e8411!2sRDM+MOTORS+LLC!5e0!3m2!1sen!2sus!4v1706132742964!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="RDM Motors Location"
                className="opacity-90 hover:opacity-100 transition-all duration-700 ease-in-out"
              ></iframe>
              <a
                href="https://www.google.com/maps/place/RDM+MOTORS+LLC/@41.089704,-93.2588237,17z/data=!3m1!4b1!4m6!3m5!1s0x87e931995f4fe7dd:0xbacec924365e8411!8m2!3d41.089704!4d-93.2588237!16s%2Fg%2F11trn0qvkj"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-10"
              ></a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-neutral-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 text-neutral-400">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-white/50">
              ESTABLISHED 2017
            </p>
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-800"></span>
            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-neutral-500">
              Dealer #D50578
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
