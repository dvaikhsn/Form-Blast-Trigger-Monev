import React, { useState } from 'react';
import { Send, MapPin, Calendar, User, Mail, Phone, Info, Settings, AlertCircle, CheckCircle, Search, Server, Radio } from 'lucide-react';

const LOGO_SNT = "snt.png";

// --- DATA 1: MONEV RT (DATA LAMA) ---
const RAW_RT_CITIES = [
  "Agats", "Ambon", "Bacan", "Balikpapan", "Banda Aceh", "Bandar Lampung", "Banggai", "Banjarbaru", 
  "Barru", "Batam", "Baubau", "Bengkulu", "Berau", "Bima", "Boven Digoel", "Bula", "Buleleng", 
  "Buli Serani", "Cikarang", "Cirebon", "Denpasar", "Dobo", "Dumai", "Falabisahaya", "Gunung Sitoli", 
  "Jambi", "Jayapura", "Kaimana", "Kalabahi", "Kefamenanu", "Kendari", "Kepi", "Ketapang", "Kolaka", 
  "Kotamobagu", "Kupang", "Lahoeroes", "Lhokseumawe", "Long Bagun", "Luwuk", "Malinau", "Mamuju", 
  "Manado", "Manokwari", "Maumere", "Medan", "Merauke", "Meulaboh", "Morotai", "Morowali", "Mukomuko", 
  "Nabire", "Namlea", "Ogan Komering Ulu", "Padang", "Palangkaraya", "Palembang", "Palopo", "Palu", 
  "Pangkal Pinang", "Pangkalan Bun", "Panyabungan", "Pekanbaru", "Pesisir Barat", "Plampang", 
  "Pontianak", "Puruk Cahu", "Putusibau", "Ranai", "Reksonegoro", "Ruteng", "Sambas", "Sarmi", 
  "Saumlaki", "Senggi", "Serui", "Sibolga", "Sintang", "Solo", "Sorong", "Sorong Selatan", 
  "Sumenep", "Sumbawa Besar", "Surabaya", "Tahuna", "Tanete", "Tarakan", "Ternate", "Tiakur", 
  "Timika", "Tolitoli", "Tua", "Tuban", "Waingapu", "Wamena"
];

const RT_LOCATIONS = [...new Set(RAW_RT_CITIES)].sort().map((city, index) => ({
  id: `RT-${index + 1}`.padStart(7, '0'),
  name: city,
  category: 'Reference Terminal',
  notes: `Lakukan pengecekan rutin perangkat infrastruktur RT dan validasi log performa di lokasi ${city}. Pastikan dokumentasi foto lengkap.`
}));

// --- DATA 2: MONEV GATEWAY (DATA BARU) ---
const RAW_GATEWAY_CITIES = [
  "GW 01 Batam", "GW 02 Cikarang", "GW 07 Kupang", "GW 03 Pontianak", 
  "GW 04 Banjarmasin", "GW 06 Manado", "GW 08 Ambon", "GW 09 Manokwari", 
  "GW 10 Timika", "GW 11 Jayapura", "GW 05 Tarakan"
];

const GATEWAY_LOCATIONS = RAW_GATEWAY_CITIES.sort().map((gw, index) => ({
  id: `GW-${index + 1}`.padStart(7, '0'),
  name: gw,
  category: 'Gateway',
  notes: `Lakukan inspeksi menyeluruh pada perangkat Gateway utama di ${gw}. Cek parameter satelit, power, dan suhu ruangan server.`
}));

export default function MonevForm() {
  const [formData, setFormData] = useState({
    monevType: 'RT', // Default: Reference Terminal
    name: '',
    date: new Date().toISOString().split('T')[0],
    locationId: '',
    email: '',
    whatsapp: '',
  });

  // State untuk webhook (Default URL yang kamu berikan)
  const [webhookUrl, setWebhookUrl] = useState('https://snt-operations.site/webhook/snt-monev');
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState('idle');
  const [selectedLocationDetails, setSelectedLocationDetails] = useState(null);

  // Logic untuk menentukan list mana yang dipakai
  const currentLocations = formData.monevType === 'RT' ? RT_LOCATIONS : GATEWAY_LOCATIONS;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      // Jika user ganti tipe Monev, reset lokasi yang dipilih sebelumnya
      if (name === 'monevType') {
        setSelectedLocationDetails(null);
        return { ...prev, [name]: value, locationId: '' };
      }
      return { ...prev, [name]: value };
    });

    if (name === 'locationId') {
      // Cari lokasi di list yang sedang aktif
      const loc = currentLocations.find(l => l.id === value);
      setSelectedLocationDetails(loc || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    const payload = {
      ...formData,
      locationName: selectedLocationDetails?.name || 'Unknown',
      locationCategory: selectedLocationDetails?.category || 'Unknown', // RT atau Gateway
      notesSent: selectedLocationDetails?.notes || '',
      timestamp: new Date().toISOString(),
      source: 'Web Form Monev SNT'
    };

    console.log("Payload siap dikirim ke n8n:", payload);

    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (response.ok || response.type === 'opaque') {
            setStatus('success');
        } else {
            setStatus('error');
        }
      } catch (error) {
        console.error("Error sending to webhook:", error);
        setStatus('error');
      }
    } else {
      setTimeout(() => setStatus('success'), 1500);
    }
  };

  const resetForm = () => {
    setFormData({
      monevType: 'RT',
      name: '',
      date: new Date().toISOString().split('T')[0],
      locationId: '',
      email: '',
      whatsapp: '',
    });
    setSelectedLocationDetails(null);
    setStatus('idle');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8">
      
      {/* Header dengan Logo SNT */}
      <div className="max-w-xl mx-auto mb-8 text-center">
        <div className="flex justify-center mb-6">
           <img 
             src={LOGO_SNT} 
             alt="SNT Logo" 
             className="h-20 w-auto object-contain" 
           />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Form Monitoring Evaluasi</h1>
        <p className="text-slate-500 text-sm mt-1">SNT Operational Report System</p>
      </div>

      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Success State */}
        {status === 'success' ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Data Terkirim!</h2>
            <p className="text-slate-600 mb-6">
              Cek email untuk melihat Laporan <strong>Monev {formData.monevType === 'RT' ? 'RT' : 'Gateway'}</strong> untuk lokasi <strong>{selectedLocationDetails?.name}</strong>. 
            </p>
            <button 
              onClick={resetForm}
              className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
            >
              Isi Form Baru
            </button>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            
            {/* 1. PILIH JENIS MONEV (Fitur Baru) */}
            <div className="space-y-2 mb-2">
               <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                 <Server className="w-4 h-4 text-orange-500" /> Pilih Jenis Monev
               </label>
               <div className="grid grid-cols-2 gap-3">
                 <label className={`cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${formData.monevType === 'RT' ? 'bg-orange-50 border-orange-500 text-orange-700 font-bold' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name="monevType" 
                      value="RT" 
                      checked={formData.monevType === 'RT'}
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <span>Monev RT</span>
                 </label>
                 
                 <label className={`cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${formData.monevType === 'Gateway' ? 'bg-orange-50 border-orange-500 text-orange-700 font-bold' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name="monevType" 
                      value="Gateway" 
                      checked={formData.monevType === 'Gateway'}
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <span>Monev Gateway</span>
                 </label>
               </div>
            </div>

            <hr className="border-slate-100" />

            {/* Nama */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" /> Nama PIC
              </label>
              <input 
                type="text" 
                name="name"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="Nama Lengkap Anda"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            {/* Tanggal & Lokasi Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-500" /> Tanggal Kunjungan
                </label>
                <input 
                  type="date" 
                  name="date"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" /> Lokasi {formData.monevType}
                </label>
                <div className="relative">
                  <select 
                    name="locationId"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all appearance-none bg-white cursor-pointer"
                    value={formData.locationId}
                    onChange={handleInputChange}
                  >
                    {/* Placeholder dinamis */}
                    <option value="" disabled>
                        Pilih {formData.monevType === 'RT' ? 'Kota' : 'Gateway'}...
                    </option>
                    
                    {/* Mapping data sesuai jenis yang dipilih */}
                    {currentLocations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 pl-1">
                  *Menampilkan daftar {formData.monevType === 'RT' ? 'Monev RT' : 'Monev Gateway'}
                </p>
              </div>
            </div>

            {/* Dynamic Briefing Note */}
            {selectedLocationDetails && (
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-orange-800 font-semibold text-sm flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4" />
                  Note: {selectedLocationDetails.name}
                </h4>
                <p className="text-orange-700 text-sm leading-relaxed">
                  "{selectedLocationDetails.notes}"
                </p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500" /> Email Perusahaan
              </label>
              <input 
                type="email" 
                name="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="email@kantor.co.id"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500" /> Nomor WhatsApp
              </label>
              <input 
                type="tel" 
                name="whatsapp"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="628123456789"
                value={formData.whatsapp}
                onChange={handleInputChange}
              />
            </div>

            {/* Tombol Submit */}
            <button 
              type="submit" 
              disabled={status === 'submitting'}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {status === 'submitting' ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Kirim Data Monev
                </>
              )}
            </button>

            {/* Error Message */}
            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm mt-2">
                <AlertCircle className="w-4 h-4" />
                Gagal mengirim data. Cek koneksi atau Webhook URL.
              </div>
            )}

          </form>
        )}
      </div>

      {/* Developer/n8n Settings Toggle */}
      <div className="max-w-xl mx-auto mt-8 pb-10">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 text-slate-400 text-sm hover:text-slate-600 transition-colors mx-auto"
        >
          <Settings className="w-4 h-4" /> SNT Operational 
        </button>
        
        {showSettings && (
          <div className="mt-4 p-4 bg-slate-200 rounded-xl animate-in fade-in">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
              n8n Webhook URL (Method: POST)
            </label>
            <input 
              type="text" 
              placeholder="https://snt-operations.site/webhook/snt-monev" 
              className="w-full px-3 py-2 text-sm rounded border border-slate-300 mb-2"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              Default URL sudah di-set. Ubah jika perlu.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
