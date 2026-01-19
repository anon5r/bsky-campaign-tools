import {useLanguage} from '../contexts/LanguageContext';
import clsx from 'clsx';

export function Footer() {
  const {t} = useLanguage();
  return (
    <footer className={clsx('bg-gray-800 text-white p-4', 'text-center')}>
      <p>{t.footer.credit.developedBy} <a href="https://bsky.app/profile/anon5r.com">@anon5r.com</a></p>
    </footer>
  );
}