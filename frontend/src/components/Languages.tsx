import SimpleTablePage from './shared/SimpleTablePage';
import { useTranslation } from "react-i18next";

export default function Languages() {
    const { t } = useTranslation();
    return <SimpleTablePage title={t('titles.languages')} endpoint="languages" />;
}