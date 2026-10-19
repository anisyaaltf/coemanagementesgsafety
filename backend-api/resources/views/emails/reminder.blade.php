<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pengingat Jadwal Kegiatan - ESG & Safety</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 24px 12px;
      line-height: 1.6;
    }
    .email-container {
      max-width: 540px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header-bar {
      background: linear-gradient(135deg, #0e1d2e 0%, #1e3a5f 100%);
      padding: 20px 24px;
      color: #ffffff;
    }
    .header-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .header-sub {
      margin: 4px 0 0 0;
      font-size: 12px;
      opacity: 0.8;
    }
    .content-body {
      padding: 28px 24px;
      font-size: 15px;
      color: #334155;
    }
    .salutation {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 14px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 700;
      color: #0284c7;
      margin-bottom: 12px;
    }
    .badge-container {
      margin-bottom: 16px;
    }
    .reminder-badge {
      display: inline-block;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 800;
      border-radius: 9999px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      background-color: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
    }
    .badge-urgent {
      background-color: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
      animation: pulse 2s infinite;
    }
    .badge-today {
      background-color: #fef9c3;
      color: #854d0e;
      border: 1px solid #fde047;
    }
    .event-card {
      background-color: #f0f9ff;
      border-left: 4px solid #0284c7;
      border-radius: 6px;
      padding: 16px;
      margin: 18px 0;
    }
    .event-card-urgent {
      background-color: #fff7ed;
      border-left: 4px solid #ea580c;
    }
    .event-label {
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 700;
      color: #0369a1;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .event-label-urgent {
      color: #c2410c;
    }
    .event-name {
      font-size: 17px;
      font-weight: 800;
      color: #0c4a6e;
      margin: 0 0 8px 0;
    }
    .event-name-urgent {
      color: #7c2d12;
    }
    .event-datetime {
      font-size: 14px;
      font-weight: 600;
      color: #334155;
      margin: 0;
    }
    .closing {
      margin-top: 20px;
      font-size: 15px;
      color: #475569;
    }
    .cheer {
      margin-top: 14px;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }
    .signature {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px dashed #cbd5e1;
      font-size: 14px;
      font-weight: 800;
      color: #0e1d2e;
      letter-spacing: 0.5px;
    }
    .footer-bar {
      background-color: #f8fafc;
      padding: 14px 24px;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
      border-top: 1px solid #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header-bar">
      <div class="header-title">ESG & SAFETY</div>
      <div class="header-sub">Pengingat Jadwal Kegiatan (Reminder)</div>
    </div>
    
    <div class="content-body">
      <div class="salutation">Salam, Aku Prima 👋</div>
      
      <div class="greeting">Halo {{ $picName }}!!!</div>
      
      <div class="badge-container">
        @if(($reminderTag ?? '') === 'Kegiatan Baru' || ($reminderTag ?? '') === 'New Event Added')
          <span class="reminder-badge" style="background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">✨ Agenda Kegiatan Baru Ditambahkan</span>
        @elseif(($reminderTag ?? '') === 'H-1 Jam')
          <span class="reminder-badge badge-urgent">⏱ Pengingat: 1 Jam Lagi Dimulai (H-1 Jam)</span>
        @elseif(($reminderTag ?? '') === 'Hari H')
          <span class="reminder-badge badge-today">📅 Pengingat: Hari H (Hari Ini)</span>
        @elseif(($reminderTag ?? '') === 'H-1')
          <span class="reminder-badge">⏳ Pengingat H-1 (Besok)</span>
        @elseif(($reminderTag ?? '') === 'H-3')
          <span class="reminder-badge">⏳ Pengingat H-3</span>
        @elseif(($reminderTag ?? '') === 'H-7')
          <span class="reminder-badge">⏳ Pengingat H-7 (1 Minggu Lagi)</span>
        @else
          <span class="reminder-badge">🔔 Pengingat Jadwal Kegiatan</span>
        @endif
      </div>

      <p style="margin: 0 0 12px 0;">{{ $reminderNote ?? 'Anda memiliki jadwal kegiatan:' }}</p>
      
      <div class="event-card {{ ($reminderTag ?? '') === 'H-1 Jam' ? 'event-card-urgent' : '' }}">
        <div class="event-label {{ ($reminderTag ?? '') === 'H-1 Jam' ? 'event-label-urgent' : '' }}">Nama Kegiatan:</div>
        <div class="event-name {{ ($reminderTag ?? '') === 'H-1 Jam' ? 'event-name-urgent' : '' }}">{{ $eventName }}</div>
        
        <div class="event-label {{ ($reminderTag ?? '') === 'H-1 Jam' ? 'event-label-urgent' : '' }}" style="margin-top: 10px;">Pada:</div>
        <div class="event-datetime">📅 {{ $eventDateTime }}</div>
        @if(!empty($location))
        <div class="event-datetime" style="margin-top: 4px;">📍 {{ $location }}</div>
        @endif
      </div>
      
      <div class="closing">
        Jangan lupa untuk mengikuti kegiatannya yaa....
      </div>
      
      <div class="cheer">
        Tetap Sehat dan Tetap Semangat!!! 💪
      </div>
      
      <div class="signature">
        ESG & SAFETY
      </div>
    </div>
    
    <div class="footer-bar">
      Email ini dikirim otomatis oleh Sistem CoE Management ESG & Safety.
    </div>
  </div>
</body>
</html>
