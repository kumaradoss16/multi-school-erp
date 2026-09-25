import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type SidebarStyle = 'expanded' | 'collapsed' | 'mini';
export type ContentDensity = 'comfortable' | 'compact';
export type BorderRadiusStyle = 'sharp' | 'rounded' | 'soft';
export type FontSizeScale = 'small' | 'medium' | 'large';
export type CardStyle = 'elevated' | 'bordered' | 'flat';
export type ColorTheme = 'blue' | 'emerald' | 'violet' | 'rose' | 'orange' | 'slate';

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme') as ThemeMode) || 'system';
  });

  const [sidebarStyle, setSidebarStyle] = useState<SidebarStyle>(() => {
    return (localStorage.getItem('erp-sidebar-style') as SidebarStyle) || 'expanded';
  });

  const [contentDensity, setContentDensity] = useState<ContentDensity>(() => {
    return (localStorage.getItem('erp-content-density') as ContentDensity) || 'comfortable';
  });

  const [borderRadius, setBorderRadius] = useState<BorderRadiusStyle>(() => {
    return (localStorage.getItem('erp-border-radius') as BorderRadiusStyle) || 'rounded';
  });

  const [fontSizeScale, setFontSizeScale] = useState<FontSizeScale>(() => {
    return (localStorage.getItem('erp-font-size-scale') as FontSizeScale) || 'medium';
  });

  const [cardStyle, setCardStyle] = useState<CardStyle>(() => {
    return (localStorage.getItem('erp-card-style') as CardStyle) || 'bordered';
  });

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    return (localStorage.getItem('erp-color-theme') as ColorTheme) || 'blue';
  });

  // Watch for changes and apply classes to html element
  useEffect(() => {
    const root = window.document.documentElement;
    
    // 1. Color Mode (Light/Dark/System)
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem('theme', theme);

    // 2. Sidebar Style
    root.classList.remove('sidebar-expanded', 'sidebar-collapsed', 'sidebar-mini');
    root.classList.add(`sidebar-${sidebarStyle}`);
    localStorage.setItem('erp-sidebar-style', sidebarStyle);

    // 3. Content Density
    root.classList.remove('density-comfortable', 'density-compact');
    root.classList.add(`density-${contentDensity}`);
    localStorage.setItem('erp-content-density', contentDensity);

    // 4. Border Radius
    root.classList.remove('radius-sharp', 'radius-rounded', 'radius-soft');
    root.classList.add(`radius-${borderRadius}`);
    localStorage.setItem('erp-border-radius', borderRadius);

    // 5. Font Size Scale
    root.classList.remove('font-scale-small', 'font-scale-medium', 'font-scale-large');
    root.classList.add(`font-scale-${fontSizeScale}`);
    localStorage.setItem('erp-font-size-scale', fontSizeScale);

    // 6. Card Style
    root.classList.remove('card-elevated', 'card-bordered', 'card-flat');
    root.classList.add(`card-${cardStyle}`);
    localStorage.setItem('erp-card-style', cardStyle);

    // 7. Color Theme Preset
    root.classList.remove('theme-blue', 'theme-emerald', 'theme-violet', 'theme-rose', 'theme-orange', 'theme-slate');
    root.classList.add(`theme-${colorTheme}`);
    localStorage.setItem('erp-color-theme', colorTheme);

  }, [theme, sidebarStyle, contentDensity, borderRadius, fontSizeScale, cardStyle, colorTheme]);

  return {
    theme,
    setTheme,
    sidebarStyle,
    setSidebarStyle,
    contentDensity,
    setContentDensity,
    borderRadius,
    setBorderRadius,
    fontSizeScale,
    setFontSizeScale,
    cardStyle,
    setCardStyle,
    colorTheme,
    setColorTheme,
  };
};
