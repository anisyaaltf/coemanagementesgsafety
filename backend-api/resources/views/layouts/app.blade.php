<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'COE Management - ESG & Safety')</title>

    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @stack('styles')
</head>
<body class="bg-bg text-ink font-sans antialiased overflow-hidden">
    <div class="flex h-screen bg-bg font-sans overflow-hidden relative" id="admin-shell">
        <!-- Mobile Backdrop Overlay -->
        <div id="mobile-backdrop" class="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden hidden" onclick="toggleSidebar()"></div>

        <!-- Sidebar -->
        <aside id="main-sidebar" class="fixed lg:static inset-y-0 left-0 w-72 max-w-[85vw] lg:w-64 bg-gradient-to-b from-[#091523] via-[#0E1D2E] to-[#07111C] text-surface flex flex-col shadow-2xl z-40 transition-transform duration-300 ease-in-out border-r border-white/5 -translate-x-full lg:translate-x-0">
            <!-- Sidebar Header & Logo -->
            <div class="p-4 border-b border-white/10 flex flex-col gap-3">
                <div class="bg-white p-3 rounded-xl flex items-center justify-center border border-white/15 hover:bg-gray-100 transition-all duration-200">
                    <img src="/img/logoNM.png" alt="Astra Otoparts Nusametal Division" class="h-10 sm:h-12 w-auto max-w-full object-contain" />
                </div>
                <div class="flex items-center justify-between px-1">
                    <div class="flex items-center gap-2">
                        <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span class="text-xs font-bold text-gray-200 tracking-wider uppercase">ESG & SAFETY COE</span>
                    </div>
                    <button class="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg focus:outline-none" onclick="toggleSidebar()">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
            </div>

            <!-- Navigation Links -->
            <nav class="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                @php
                    $navItems = [
                        ['name' => 'Dashboard', 'url' => '/dashboard', 'icon' => 'layout-dashboard', 'active' => request()->is('dashboard*')],
                        ['name' => 'Kalender Event', 'url' => '/kalender', 'icon' => 'calendar', 'active' => request()->is('kalender*')],
                        ['name' => 'Prioritas Kegiatan', 'url' => '/prioritas/manage', 'icon' => 'alert-triangle', 'active' => request()->is('prioritas/manage*')],
                        ['name' => 'PIC', 'url' => '/pic', 'icon' => 'users', 'active' => request()->is('pic*')],
                        ['name' => 'Notifikasi', 'url' => '/notifikasi', 'icon' => 'bell', 'active' => request()->is('notifikasi*')],
                        ['name' => 'Pengaturan', 'url' => '/pengaturan', 'icon' => 'settings', 'active' => request()->is('pengaturan*')],
                    ];
                @endphp

                @foreach($navItems as $item)
                    <a href="{{ $item['url'] }}"
                       class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 {{ $item['active'] ? 'bg-gradient-to-r from-accent/90 to-amber-500 text-ink font-bold shadow-lg shadow-accent/20' : 'text-gray-300 hover:text-white hover:bg-white/10' }}">
                        @if($item['icon'] === 'layout-dashboard')
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                        @elseif($item['icon'] === 'calendar')
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        @elseif($item['icon'] === 'alert-triangle')
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        @elseif($item['icon'] === 'users')
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                        @elseif($item['icon'] === 'bell')
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                        @elseif($item['icon'] === 'settings')
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        @endif
                        <span>{{ $item['name'] }}</span>
                    </a>
                @endforeach
            </nav>

            <!-- Sidebar Footer -->
            <div class="p-3 border-t border-white/10 space-y-2">
                <a href="/" class="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    <span>Lihat Halaman Publik</span>
                </a>
                <button onclick="handleLogout()" class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    <span>Keluar Sistem</span>
                </button>
            </div>
        </aside>

        <!-- Main Body -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-bg">
            <!-- Top Navbar Header -->
            <header class="h-16 bg-surface border-b border-line px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
                <div class="flex items-center gap-3">
                    <button onclick="toggleSidebar()" class="lg:hidden p-2 text-ink-soft hover:text-ink hover:bg-bg rounded-lg cursor-pointer">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                    </button>
                    <div>
                        <h2 class="text-base sm:text-lg font-extrabold text-ink leading-tight">@yield('page_title', 'Dashboard')</h2>
                        <p class="text-xs text-ink-soft hidden sm:block">PT Astra Otoparts Tbk - Nusametal Division</p>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2.5 bg-bg/80 pl-2 pr-3 py-1.5 rounded-full border border-line">
                        <div id="user-avatar-initial" class="w-7 h-7 rounded-full bg-navy-deep text-surface text-xs font-bold flex items-center justify-center">A</div>
                        <span id="user-display-name" class="text-xs font-semibold text-ink">Admin Safety</span>
                    </div>
                </div>
            </header>

            <!-- Scrollable Page Content -->
            <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                @yield('content')
            </main>
        </div>
    </div>

    <script>
        function toggleSidebar() {
            const sidebar = document.getElementById('main-sidebar');
            const backdrop = document.getElementById('mobile-backdrop');
            const isOpen = !sidebar.classList.contains('-translate-x-full');
            if (isOpen) {
                sidebar.classList.add('-translate-x-full');
                backdrop.classList.add('hidden');
            } else {
                sidebar.classList.remove('-translate-x-full');
                backdrop.classList.remove('hidden');
            }
        }

        function handleLogout() {
            if (confirm('Apakah Anda yakin ingin keluar?')) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.name) {
                const nameEl = document.getElementById('user-display-name');
                const avatarEl = document.getElementById('user-avatar-initial');
                if (nameEl) nameEl.textContent = user.name;
                if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
            }
        } catch(e) {}
    </script>
    @stack('scripts')
</body>
</html>
