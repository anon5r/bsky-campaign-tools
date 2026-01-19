import {AlertTriangle} from 'lucide-react';
import {useLanguage} from '../contexts/LanguageContext';
import {translations} from '../i18n/translations';
import clsx from 'clsx';

interface DisclaimerProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export function Disclaimer({className, variant = 'light'}: DisclaimerProps) {
  const {language} = useLanguage();
  const isDark = variant === 'dark';

  // Determine order: preferred language first
  const languages = language === 'ja' ? ['ja', 'en'] as const : ['en', 'ja'] as const;

  return (
    <div className={clsx(
      "rounded-lg p-4 text-xs mt-8 border text-left",
      isDark ? "bg-yellow-900/10 border-yellow-700/30 text-gray-400" : "bg-yellow-50 border-yellow-200 text-gray-600",
      className
    )}>
      {languages.map((lang, index) => {
        const t = translations[lang];
        const isFirst = index === 0;

        return (
          <div key={lang} className={clsx(
            !isFirst && "mt-4 pt-4 border-t border-dashed",
            !isFirst && (isDark ? "border-white/10" : "border-black/10")
          )}>
            <h3 className={clsx(
              "font-semibold flex items-center mb-2",
              isDark ? "text-yellow-500" : "text-yellow-700"
            )}>
              <AlertTriangle className="w-4 h-4 mr-1.5"/>
              {t.disclaimerTitle}
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>{t.simpleApp}</li>
              <li>{t.apiUsage}</li>
              <li>{t.noMultiAccount}</li>
              <li className="list-none mt-2 pt-2 border-t border-dashed"
                  style={{borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}}>
                <ul className="list-disc list-inside space-y-1 opacity-90">
                  <li>{t.disclaimerList1}</li>
                  <li>{t.disclaimerList2}</li>
                  <li>{t.disclaimerList3}</li>
                </ul>
              </li>
            </ul>
          </div>
        );
      })}
    </div>
  );
}
