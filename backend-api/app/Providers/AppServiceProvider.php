<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Blade::directive('viteReactRefresh', function () {
            $hotFile = public_path('hot');
            if (file_exists($hotFile)) {
                $url = rtrim(file_get_contents($hotFile));
                return "<?php echo '<script type=\"module\">
                    import RefreshRuntime from \"{$url}/@react-refresh\";
                    RefreshRuntime.injectIntoGlobalHook(window);
                    window.\$RefreshReg\$ = () => {};
                    window.\$RefreshSig\$ = () => (type) => type;
                    window.__vite_plugin_react_preamble_installed__ = true;
                </script>'; ?>";
            }
            return '';
        });

        Blade::directive('vite', function ($expression) {
            return "<?php
                \$hotFile = public_path('hot');
                \$entries = {$expression};
                if (!is_array(\$entries)) {
                    \$entries = [\$entries];
                }

                if (file_exists(\$hotFile)) {
                    \$url = rtrim(file_get_contents(\$hotFile));
                    echo '<script type=\"module\" src=\"' . \$url . '/@vite/client\"></script>';
                    foreach (\$entries as \$entry) {
                        echo '<script type=\"module\" src=\"' . \$url . '/' . \$entry . '\"></script>';
                    }
                } else {
                    \$manifestPath = public_path('build/manifest.json');
                    if (!file_exists(\$manifestPath)) {
                        \$manifestPath = base_path('public/build/manifest.json');
                    }
                    if (file_exists(\$manifestPath)) {
                        \$manifest = json_decode(file_get_contents(\$manifestPath), true);
                        foreach (\$entries as \$entry) {
                            if (isset(\$manifest[\$entry])) {
                                \$item = \$manifest[\$entry];
                                if (isset(\$item['file'])) {
                                    \$file = '/build/' . \$item['file'];
                                    if (str_ends_with(\$entry, '.css')) {
                                        echo '<link rel=\"stylesheet\" href=\"' . \$file . '\">';
                                    } else {
                                        echo '<script type=\"module\" src=\"' . \$file . '\"></script>';
                                    }
                                }
                                if (!empty(\$item['css']) && is_array(\$item['css'])) {
                                    foreach (\$item['css'] as \$cssFile) {
                                        echo '<link rel=\"stylesheet\" href=\"/build/' . \$cssFile . '\">';
                                    }
                                }
                            }
                        }
                    }
                }
            ?>";
        });
    }
}
