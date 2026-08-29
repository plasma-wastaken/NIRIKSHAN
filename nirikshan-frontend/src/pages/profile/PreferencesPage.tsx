import React, { useState } from 'react';
import { Settings, Globe, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { ToggleSetting } from '../../components/profile/ToggleSetting';

export const PreferencesPage: React.FC = () => {
  const [lang, setLang] = useState('en');
  const [dateFormat, setDateFormat] = useState('DD-MM-YYYY');
  const [theme, setTheme] = useState('system');
  const [compact, setCompact] = useState(false);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary-700" />
          General Preferences
        </h2>
        <p className="text-sm text-surface-500 mt-0.5">
          Manage language, display formats, and application appearance.
        </p>
      </div>

      {/* ── Regional & Language ────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 border-b border-surface-100">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-surface-400" />
            Regional & Language
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              label="Display Language"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              options={[
                { label: 'English (India)', value: 'en' },
                { label: 'Hindi (हिन्दी)', value: 'hi' },
              ]}
            />
            <Select
              label="Date Format"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              options={[
                { label: 'DD-MM-YYYY (e.g. 15-08-2024)', value: 'DD-MM-YYYY' },
                { label: 'MM/DD/YYYY (e.g. 08/15/2024)', value: 'MM/DD/YYYY' },
                { label: 'YYYY-MM-DD (e.g. 2024-08-15)', value: 'YYYY-MM-DD' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Appearance ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 border-b border-surface-100">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4 text-surface-400" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="max-w-xs">
            <Select
              label="Theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              options={[
                { label: 'System Default', value: 'system' },
                { label: 'Light',          value: 'light' },
                { label: 'Dark',           value: 'dark' },
              ]}
            />
          </div>

          <div className="pt-2 border-t border-surface-100">
            <ToggleSetting
              id="pref_compact"
              label="Compact View"
              description="Reduce padding and font sizes to show more data on screen."
              checked={compact}
              onChange={setCompact}
            />
          </div>
        </CardContent>
      </Card>
      
      <p className="text-xs text-surface-400 leading-relaxed">
        Preferences are saved locally for this browser. They will sync across devices once backend integration is complete.
      </p>
    </div>
  );
};
