<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Kalender Kegiatan - ESG & Safety COE')</title>

    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @stack('styles')
</head>
<body class="min-h-screen bg-bg flex flex-col font-sans text-ink antialiased">
    <!-- Public Header -->
    <header class="bg-surface border-b border-line px-3.5 sm:px-6 py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-30 shadow-xs">
        <div class="flex items-center justify-between gap-2.5">
            <a href="/" class="flex items-center gap-2.5 sm:gap-3 hover:opacity-90 transition-opacity min-w-0">
                <img 
                    src="/img/logoNM-transparent.png" 
                    alt="Astra Otoparts Nusametal Division" 
                    class="h-8 sm:h-10 md:h-11 w-auto max-w-[140px] sm:max-w-none object-contain shrink-0" 
                />
                <div class="border-l border-line pl-2.5 sm:pl-3 min-w-0">
                    <h1 class="text-xs sm:text-base font-extrabold text-ink leading-tight m-0 truncate">ESG & SAFETY</h1>
                    <p class="text-[9px] sm:text-[10px] text-ink-soft font-semibold tracking-wider uppercase m-0 truncate">COE Management</p>
                </div>
            </a>
            <button
                onclick="togglePublicMenu()"
                class="md:hidden p-2 text-ink-soft hover:text-ink hover:bg-bg rounded-lg focus:outline-none transition-colors cursor-pointer shrink-0"
                title="Toggle Navigation Menu"
            >
                <svg id="menu-icon-open" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                <svg id="menu-icon-close" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>

        <!-- Navigation Links & Auth Buttons -->
        <div
            id="public-nav-menu"
            class="hidden md:flex flex-col md:flex-row md:items-center gap-3.5 md:gap-4 mt-3.5 md:mt-0 pt-3.5 md:pt-0 border-t md:border-t-0 border-line animate-fadeIn"
        >
            <nav class="flex flex-col md:flex-row gap-2 md:gap-5">
                <a
                    href="/"
                    class="font-semibold transition-colors text-sm py-2 px-3 md:px-0 md:py-0 rounded-lg {{ request()->is('/') ? 'text-accent font-bold' : 'text-ink hover:text-accent hover:bg-bg md:hover:bg-transparent' }}"
                >
                    Kalender Event
                </a>
                <a
                    href="/prioritas"
                    class="font-semibold transition-colors text-sm py-2 px-3 md:px-0 md:py-0 rounded-lg {{ request()->is('prioritas') ? 'text-accent font-bold' : 'text-ink hover:text-accent hover:bg-bg md:hover:bg-transparent' }}"
                >
                    Prioritas Kegiatan
                </a>
            </nav>
            <div class="pt-2 md:pt-0 flex flex-col sm:flex-row gap-2">
                <a
                    href="/register"
                    class="inline-block w-full md:w-auto text-center border border-navy-deep text-navy-deep hover:bg-navy-deep hover:text-white px-4 py-2 rounded-lg transition-colors font-bold text-sm shadow-2xs"
                >
                    Register
                </a>
                <a
                    href="/login"
                    class="inline-block w-full md:w-auto text-center bg-navy-deep text-surface px-4 py-2 rounded-lg hover:bg-ink transition-colors font-bold text-sm shadow-xs"
                >
                    Login
                </a>
            </div>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-5 lg:p-7">
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="py-4 text-center text-xs sm:text-sm text-ink-soft border-t border-line mt-auto bg-surface">
        Public Read Only &bull; PT Astra Otoparts Tbk - Nusametal Division
    </footer>

    <script>
        function togglePublicMenu() {
            const menu = document.getElementById('public-nav-menu');
            const openIcon = document.getElementById('menu-icon-open');
            const closeIcon = document.getElementById('menu-icon-close');
            const isHidden = menu.classList.contains('hidden');
            if (isHidden) {
                menu.classList.remove('hidden');
                menu.classList.add('flex');
                openIcon.classList.add('hidden');
                closeIcon.classList.remove('hidden');
            } else {
                menu.classList.add('hidden');
                menu.classList.remove('flex');
                openIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            }
        }
    </script>
    @stack('scripts')
</body>
</html>
