import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Download, QrCode, ShieldCheck } from 'lucide-react';
import UpiPaymentCard from '../components/UpiPaymentCard';

export default function DirectPaymentPage() {
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingId: string;
    ticketCode: string;
    name: string;
    amount: number;
    date: string;
  } | null>(null);

  const handlePaymentSuccess = (utr: string) => {
    const bookingId = 'AWS-SCD-' + Math.floor(100000 + Math.random() * 900000);
    const ticketCode = 'TKT-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const record = {
      bookingId,
      ticketCode,
      name: attendeeName.trim() || 'AWS SCD Participant',
      amount: 149,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    const existing = JSON.parse(localStorage.getItem('aws_scd_registrations') || '[]');
    existing.push({
      ...record,
      email: attendeeEmail.trim() || 'attendee@aws-scd.com',
      studentName: record.name,
      college: 'Direct UPI Booking',
      prnRollNo: utr,
      status: 'CONFIRMED',
    });
    localStorage.setItem('aws_scd_registrations', JSON.stringify(existing));

    setConfirmedBooking(record);
  };

  return (
    <div className="min-h-screen bg-[#070B13] text-[#F1F5F9] font-sans antialiased selection:bg-[#6366F1] selection:text-white pb-16">
      {/* Top Banner Navigation */}
      <nav className="border-b border-[#1A2333] bg-[#0A0E18]/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link
            to="/register"
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Full Registration</span>
          </Link>

          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Instant UPI Gateway
          </span>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 pt-6 sm:pt-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141C2D] border border-[#243044] text-[11px] font-mono tracking-wider uppercase text-slate-300 shadow-sm">
            <span>Direct Payment Gateway · Free of Cost</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Pay ₹149 via UPI</h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Pay directly to Bhushan Jadhav (<span className="font-mono text-indigo-400">aj6244249-1@okaxis</span>) with zero transaction fees.
          </p>
        </div>

        {!confirmedBooking ? (
          <div className="space-y-6">
            {/* Quick Attendee Name (Optional) */}
            <div className="bg-[#121A2A] border border-[#233147] rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">
                Ticket Holder Info (For Generating Pass)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={attendeeName}
                  onChange={e => setAttendeeName(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-[#243044] text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#5856D6]"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={attendeeEmail}
                  onChange={e => setAttendeeEmail(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-[#243044] text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#5856D6]"
                />
              </div>
            </div>

            {/* UPI Component */}
            <UpiPaymentCard
              amount={149}
              payeeName="Bhushan Jadhav"
              upiId="aj6244249-1@okaxis"
              transactionNote="AWS SCD 2026 Ticket"
              onPaymentDone={handlePaymentSuccess}
            />
          </div>
        ) : (
          /* Success Pass Card */
          <div className="bg-[#101726] border border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Payment Received!</h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Your ₹149 payment has been recorded and ticket pass generated.
              </p>
            </div>

            <div className="bg-[#070B13] border-2 border-[#5856D6]/60 rounded-xl p-6 text-left space-y-4 font-mono shadow-xl relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#5856D6] font-bold">
                    Official Participant Pass
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{confirmedBooking.name}</h3>
                  <p className="text-xs text-slate-400">AWS Student Community Day 2026</p>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1E293B] text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">BOOKING ID</span>
                  <strong className="text-emerald-400">{confirmedBooking.bookingId}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TICKET CODE</span>
                  <strong className="text-amber-300">{confirmedBooking.ticketCode}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">AMOUNT PAID</span>
                  <span className="text-slate-200">₹{confirmedBooking.amount} (UPI)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">DATE</span>
                  <span className="text-slate-200">{confirmedBooking.date}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-[#5856D6] hover:bg-[#6865EE] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#5856D6]/20 transition-colors"
              >
                <Download className="w-4 h-4" />
                Save / Print Pass
              </button>

              <Link
                to="/"
                className="flex-1 bg-[#1A2333] hover:bg-[#253247] text-slate-200 font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center transition-colors"
              >
                Back to Main Site
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
